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
  padding: 0.5rem $spacing-4;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  letter-spacing: -0.01em;
  line-height: $line-height-normal;
  transition: background $transition-fast, color $transition-fast,
    border-color $transition-fast, box-shadow $transition-fast;
  white-space: nowrap;
  cursor: pointer;

  &:disabled,
  &--loading {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  // Variants
  &--primary {
    background: $color-primary;
    color: $color-text-inverse;
    border: 1px solid transparent;
    box-shadow: 0 1px 2px rgba(79, 70, 229, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);

    &:hover:not(:disabled) {
      background: $color-primary-hover;
      box-shadow: 0 2px 6px rgba(79, 70, 229, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08);
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
    box-shadow: 0 1px 2px rgba(239, 68, 68, 0.25);

    &:hover:not(:disabled) {
      background: $color-danger-hover;
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
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
