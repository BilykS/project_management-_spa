<template>
  <form class="task-form" novalidate @submit.prevent="onSubmit">

    <!-- Title -->
    <div class="field" :class="{ 'field--error': errors.title }">
      <label class="field__label" for="task-title">
        Назва <span class="field__required">*</span>
      </label>
      <input
        id="task-title"
        v-model.trim="form.title"
        class="field__input"
        type="text"
        placeholder="Введіть назву завдання"
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
      <label class="field__label" for="task-assignee">Виконавець</label>
      <div class="select-wrapper">
        <select id="task-assignee" v-model="form.assignee" class="field__input field__input--select" @change="($event.target as HTMLSelectElement).blur()">
          <option value="">Без виконавця</option>
          <option v-for="a in ASSIGNEES" :key="a.id" :value="a.name">{{ a.name }}</option>
        </select>
        <ChevronDown :size="14" class="select-wrapper__icon" />
      </div>
    </div>

    <!-- Status -->
    <div class="field" :class="{ 'field--error': errors.status }">
      <label class="field__label" for="task-status">
        Статус <span class="field__required">*</span>
      </label>
      <div class="select-wrapper">
        <select
          id="task-status"
          v-model="form.status"
          class="field__input field__input--select"
          @change="($event.target as HTMLSelectElement).blur()"
          @blur="validateStatus"
        >
          <option value="">Оберіть статус</option>
          <option v-for="s in TASK_STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <ChevronDown :size="14" class="select-wrapper__icon" />
      </div>
      <span v-if="errors.status" class="field__error">{{ errors.status }}</span>
    </div>

    <!-- Due date -->
    <div class="field" :class="{ 'field--error': errors.dueDate }">
      <label class="field__label" for="task-due">
        Термін виконання <span class="field__required">*</span>
      </label>
      <div class="date-wrapper">
        <input
          id="task-due"
          v-model="form.dueDate"
          class="field__input field__input--date"
          type="date"
          :min="today"
          @click="($event.target as HTMLInputElement).showPicker?.()"
          @blur="validateDueDate"
        />
        <Calendar :size="15" class="date-wrapper__icon" />
      </div>
      <span v-if="errors.dueDate" class="field__error">{{ errors.dueDate }}</span>
    </div>

    <!-- Footer -->
    <div class="task-form__footer">
      <AppButton type="button" variant="ghost" @click="emit('cancel')">Скасувати</AppButton>
      <AppButton type="submit" variant="primary" :loading="loading">
        {{ isEdit ? 'Зберегти зміни' : 'Додати завдання' }}
      </AppButton>
    </div>

  </form>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { Calendar, ChevronDown } from 'lucide-vue-next'
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
  if (!form.title.trim()) {
    errors.title = 'Назва обов\'язкова.'
    return false
  }
  if (form.title.trim().length < 3) {
    errors.title = 'Назва має бути не менше 3 символів.'
    return false
  }
  errors.title = ''
  return true
}

function validateStatus(): boolean {
  if (!form.status) {
    errors.status = 'Статус обов\'язковий.'
    return false
  }
  errors.status = ''
  return true
}

function validateDueDate(): boolean {
  if (!form.dueDate) {
    errors.dueDate = 'Термін виконання обов\'язковий.'
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
      notify.success('Завдання оновлено.')
    } else {
      const dto: CreateTaskDto = {
        projectId: props.projectId,
        title:     form.title,
        assignee:  form.assignee || null,
        status:    form.status as TaskStatus,
        dueDate:   form.dueDate,
      }
      await tasksStore.create(dto)
      notify.success('Завдання успішно створено.')
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

    &--select {
      cursor: pointer;
      appearance: none;
      padding-right: $spacing-8;
    }

    &--date {
      cursor: pointer;
      padding-right: $spacing-8;

      &::-webkit-calendar-picker-indicator {
        opacity: 0;
        width: 0;
        height: 0;
        padding: 0;
      }
    }
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

.select-wrapper {
  position: relative;

  &__icon {
    position: absolute;
    right: $spacing-3;
    top: 50%;
    transform: translateY(-50%);
    color: $color-text-muted;
    pointer-events: none;
    transition: transform $transition-fast;
  }

  &:focus-within &__icon {
    transform: translateY(-50%) rotate(180deg);
  }
}

.date-wrapper {
  position: relative;

  &__icon {
    position: absolute;
    right: $spacing-3;
    top: 50%;
    transform: translateY(-50%);
    color: $color-text-muted;
    pointer-events: none;
  }
}
</style>
