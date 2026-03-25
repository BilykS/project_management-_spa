<template>
  <button
    class="btn"
    :class="[`btn--${variant}`, { 'btn--loading': loading }]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <AppSpinner v-if="loading" size="sm" />
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
import AppSpinner from './AppSpinner.vue'

defineProps<{
  variant?: 'primary' | 'ghost' | 'danger'
  loading?:  boolean
  disabled?: boolean
}>()

// Успадковуємо нативні атрибути (type, form, тощо) — не блокуємо $attrs
defineOptions({ inheritAttrs: true })
</script>

<style scoped lang="scss">
.btn {
  @include flex-center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  line-height: $line-height-normal;
  transition: background $transition-fast, color $transition-fast,
    border-color $transition-fast, box-shadow $transition-fast;
  white-space: nowrap;
  cursor: pointer;

  &:disabled,
  &--loading {
    opacity: 0.55;
    cursor: not-allowed;
    pointer-events: none;
  }

  // Variants
  &--primary {
    background: $color-primary;
    color: $color-text-inverse;
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background: $color-primary-hover;
    }

    &:focus-visible {
      @include focus-ring;
    }
  }

  &--ghost {
    background: transparent;
    color: $color-text-secondary;
    border: 1px solid $color-border;

    &:hover:not(:disabled) {
      background: $color-bg-hover;
      color: $color-text-primary;
      border-color: $color-border-dark;
    }

    &:focus-visible {
      @include focus-ring;
    }
  }

  &--danger {
    background: $color-danger;
    color: $color-text-inverse;
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background: $color-danger-hover;
    }

    &:focus-visible {
      outline-color: $color-danger;
      outline-offset: 2px;
      outline-width: 2px;
      outline-style: solid;
    }
  }
}
</style>
