<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay"
        @mousedown.self="onOverlayClick"
      >
        <div
          class="modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <!-- Header -->
          <div class="modal__header">
            <h2 :id="titleId" class="modal__title">{{ title }}</h2>
            <button class="modal__close" aria-label="Close" @click="close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal__body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title: string
  persistent?: boolean  // if true, clicking overlay does not close
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const titleId = computed(() => `modal-title-${Math.random().toString(36).slice(2, 7)}`)

function close(): void {
  emit('update:modelValue', false)
}

function onOverlayClick(): void {
  if (!props.persistent) close()
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && props.modelValue && !props.persistent) close()
}

onMounted(()  => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  background: $color-bg-overlay;
  @include flex-center;
  padding: $spacing-4;
}

.modal {
  background: $color-bg-primary;
  border-radius: $radius-xl;
  box-shadow: $shadow-xl;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__header {
    @include flex-between;
    padding: $spacing-5 $spacing-6;
    border-bottom: 1px solid $color-border;
    flex-shrink: 0;
  }

  &__title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
  }

  &__close {
    @include flex-center;
    width: 32px;
    height: 32px;
    border-radius: $radius-md;
    color: $color-text-secondary;
    transition: background $transition-fast, color $transition-fast;

    &:hover {
      background: $color-bg-hover;
      color: $color-text-primary;
    }
  }

  &__body {
    padding: $spacing-6;
    overflow-y: auto;
    flex: 1;
    @include custom-scrollbar;
  }

  &__footer {
    @include flex-between;
    padding: $spacing-4 $spacing-6;
    border-top: 1px solid $color-border;
    gap: $spacing-3;
    flex-shrink: 0;
  }
}

// Transition
.modal-enter-active,
.modal-leave-active {
  transition: opacity $transition-base;

  .modal {
    transition: transform $transition-base, opacity $transition-base;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal {
    transform: scale(0.95) translateY(-8px);
    opacity: 0;
  }
}
</style>
