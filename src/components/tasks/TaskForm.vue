<template>
  <form class="task-form" novalidate @submit.prevent="onSubmit">

    <!-- Title -->
    <div class="field" :class="{ 'field--error': errors.title }">
      <label class="field__label" for="task-title">
        Title <span class="field__required">*</span>
      </label>
      <input
        id="task-title"
        v-model.trim="form.title"
        class="field__input"
        type="text"
        placeholder="Enter task title"
        autocomplete="off"
        maxlength="120"
        @blur="validateTitle"
      />
      <div class="field__row">
        <span v-if="errors.title" class="field__error">{{ errors.title }}</span>
        <span
          class="field__counter"
          :class="{ 'field__counter--warn': form.title.length > 100 }"
        >{{ form.title.length }}/120</span>
      </div>
    </div>

    <!-- Assignee -->
    <div class="field">
      <label class="field__label" for="task-assignee">Assignee</label>
      <select id="task-assignee" v-model="form.assignee" class="field__input field__input--select">
        <option value="">Unassigned</option>
        <option v-for="a in ASSIGNEES" :key="a.id" :value="a.name">{{ a.name }}</option>
      </select>
    </div>

    <!-- Status -->
    <div class="field" :class="{ 'field--error': errors.status }">
      <label class="field__label" for="task-status">
        Status <span class="field__required">*</span>
      </label>
      <select
        id="task-status"
        v-model="form.status"
        class="field__input field__input--select"
        @blur="validateStatus"
      >
        <option value="">Select status</option>
        <option v-for="s in TASK_STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <span v-if="errors.status" class="field__error">{{ errors.status }}</span>
    </div>

    <!-- Due date -->
    <div class="field" :class="{ 'field--error': errors.dueDate }">
      <label class="field__label" for="task-due">
        Due Date <span class="field__required">*</span>
      </label>
      <input
        id="task-due"
        v-model="form.dueDate"
        class="field__input"
        type="date"
        :min="today"
        @blur="validateDueDate"
      />
      <span v-if="errors.dueDate" class="field__error">{{ errors.dueDate }}</span>
    </div>

    <!-- Footer -->
    <div class="task-form__footer">
      <AppButton type="button" variant="ghost" @click="emit('cancel')">Cancel</AppButton>
      <AppButton type="submit" variant="primary" :loading="loading">
        {{ isEdit ? 'Save Changes' : 'Add Task' }}
      </AppButton>
    </div>

  </form>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useTasksStore } from '@/stores/tasks.store'
import { useNotification } from '@/composables/useNotification'
import { ASSIGNEES, TASK_STATUSES } from '@/types/models'
import type { Task, TaskStatus, CreateTaskDto } from '@/types/models'
import AppButton from '@/components/base/AppButton.vue'

const props = defineProps<{
  projectId: number
  task?: Task
}>()

const emit = defineEmits<{
  saved:  []
  cancel: []
}>()

const tasksStore = useTasksStore()
const notify     = useNotification()

const isEdit = computed(() => !!props.task)
const today  = new Date().toISOString().split('T')[0]

const form = reactive({
  title:    props.task?.title    ?? '',
  assignee: props.task?.assignee ?? '',
  status:   (props.task?.status  ?? '') as TaskStatus | '',
  dueDate:  props.task?.dueDate  ?? '',
})

const errors  = reactive({ title: '', status: '', dueDate: '' })
const loading = ref(false)

function validateTitle(): boolean {
  if (!form.title) {
    errors.title = 'Title is required.'
    return false
  }
  if (form.title.length < 3) {
    errors.title = 'Title must be at least 3 characters.'
    return false
  }
  errors.title = ''
  return true
}

function validateStatus(): boolean {
  if (!form.status) {
    errors.status = 'Status is required.'
    return false
  }
  errors.status = ''
  return true
}

function validateDueDate(): boolean {
  if (!form.dueDate) {
    errors.dueDate = 'Due date is required.'
    return false
  }
  errors.dueDate = ''
  return true
}

function validate(): boolean {
  return [validateTitle(), validateStatus(), validateDueDate()].every(Boolean)
}

async function onSubmit(): Promise<void> {
  if (!validate()) return

  loading.value = true
  try {
    if (isEdit.value && props.task) {
      await tasksStore.update(props.task.id, {
        title:    form.title,
        assignee: form.assignee || null,
        status:   form.status as TaskStatus,
        dueDate:  form.dueDate,
      })
      notify.success('Task updated.')
    } else {
      const dto: CreateTaskDto = {
        projectId: props.projectId,
        title:     form.title,
        assignee:  form.assignee || null,
        status:    form.status as TaskStatus,
        dueDate:   form.dueDate,
      }
      await tasksStore.create(dto)
      notify.success('Task created.')
    }
    emit('saved')
  } catch {
    // global error toast shown by axios interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.task-form {
  @include flex-column;
  gap: $spacing-5;

  &__footer {
    @include flex-between;
    gap: $spacing-3;
    padding-top: $spacing-2;
  }
}

.field {
  @include flex-column;
  gap: $spacing-1;

  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-primary;
  }

  &__required {
    color: $color-danger;
    margin-left: 2px;
  }

  &__input {
    width: 100%;
    padding: $spacing-2 $spacing-3;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $color-text-primary;
    background: $color-bg-primary;
    transition: border-color $transition-fast, box-shadow $transition-fast;
    outline: none;

    &::placeholder { color: $color-text-muted; }

    &:focus {
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba($color-primary, 0.12);
    }

    &--select { cursor: pointer; appearance: auto; }
  }

  &--error &__input {
    border-color: $color-danger;
    &:focus { box-shadow: 0 0 0 3px rgba($color-danger, 0.12); }
  }

  &__row {
    @include flex-between;
    min-height: 16px;
  }

  &__error {
    font-size: $font-size-xs;
    color: $color-danger;
  }

  &__counter {
    font-size: $font-size-xs;
    color: $color-text-muted;
    margin-left: auto;

    &--warn { color: $color-warning; }
  }
}
</style>
