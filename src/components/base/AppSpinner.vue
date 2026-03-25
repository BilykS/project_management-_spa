<template>
  <span
    class="spinner"
    :class="`spinner--${size}`"
    role="status"
    aria-label="Loading"
  />
</template>

<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>()

defineOptions({ inheritAttrs: false })
</script>

<style scoped lang="scss">
.spinner {
  display: inline-block;
  border-radius: $radius-full;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-right-color: currentColor;
  animation: spin 0.65s linear infinite;
  flex-shrink: 0;

  &--sm {
    width: 14px;
    height: 14px;
  }

  &--md {
    width: 20px;
    height: 20px;
    border-width: 2.5px;
  }

  &--lg {
    width: 32px;
    height: 32px;
    border-width: 3px;
    color: $color-primary;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
