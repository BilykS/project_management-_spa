<template>
  <form class="project-form" novalidate @submit.prevent="onSubmit">
    <!-- Name -->
    <div class="field" :class="{ 'field--error': errors.name }">
      <label class="field__label" for="proj-name">
        Project Name <span class="field__required">*</span>
      </label>
      <input
        id="proj-name"
        v-model.trim="form.name"
        class="field__input"
        type="text"
        placeholder="Enter project name"
        autocomplete="off"
        @blur="validateName"
      />
      <span v-if="errors.name" class="field__error">{{ errors.name }}</span>
    </div>

    <!-- Description -->
    <div class="field">
      <label class="field__label" for="proj-desc">Description</label>
      <textarea
        id="proj-desc"
        v-model.trim="form.description"
        class="field__input field__input--textarea"
        placeholder="Optional project description"
        rows="3"
      />
    </div>

    <!-- Footer actions -->
    <div class="project-form__footer">
      <AppButton type="button" variant="ghost" @click="emit('cancel')">
        Cancel
      </AppButton>
      <AppButton type="submit" variant="primary" :loading="loading">
        Save Project
      </AppButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useProjectsStore } from '@/stores/projects.store'
import { useNotification } from '@/composables/useNotification'
import AppButton from '@/components/base/AppButton.vue'

const emit = defineEmits<{
  saved:  []
  cancel: []
}>()

const projectsStore = useProjectsStore()
const notify        = useNotification()

const form    = reactive({ name: '', description: '' })
const errors  = reactive({ name: '' })
const loading = ref(false)

function validateName(): boolean {
  if (!form.name) {
    errors.name = 'Project name is required.'
    return false
  }
  errors.name = ''
  return true
}

async function onSubmit(): Promise<void> {
  if (!validateName()) return

  loading.value = true
  try {
    await projectsStore.create({ name: form.name, description: form.description })
    notify.success('Project created successfully.')
    emit('saved')
  } catch {
    // Глобальний error toast вже показаний через Axios interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.project-form {
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

    &--textarea {
      resize: vertical;
      min-height: 80px;
    }
  }

  &--error &__input {
    border-color: $color-danger;
    &:focus { box-shadow: 0 0 0 3px rgba($color-danger, 0.12); }
  }

  &__error {
    font-size: $font-size-xs;
    color: $color-danger;
  }
}
</style>
