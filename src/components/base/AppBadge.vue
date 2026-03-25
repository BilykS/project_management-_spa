<template>
  <span class="badge" :class="`badge--${status}`">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectStatus, TaskStatus } from '@/types/models'
import { PROJECT_STATUSES, TASK_STATUSES } from '@/types/models'

const props = defineProps<{
  status: ProjectStatus | TaskStatus
}>()

const label = computed(() => {
  const all = [...PROJECT_STATUSES, ...TASK_STATUSES]
  return all.find((s) => s.value === props.status)?.label ?? props.status
})
</script>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px $spacing-2;
  border-radius: $radius-full;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  white-space: nowrap;
  line-height: $line-height-loose;

  // Project statuses
  &--active {
    background: rgba($color-status-active, 0.12);
    color: $color-status-active;
  }

  &--completed {
    background: rgba($color-status-completed, 0.12);
    color: $color-status-completed;
  }

  &--on-hold {
    background: rgba($color-status-on-hold, 0.15);
    color: darken($color-status-on-hold, 20%);
  }

  // Task statuses
  &--todo {
    background: rgba($color-status-todo, 0.12);
    color: $color-status-todo;
  }

  &--in-progress {
    background: rgba($color-status-in-progress, 0.15);
    color: darken($color-status-in-progress, 15%);
  }

  &--done {
    background: rgba($color-status-done, 0.12);
    color: $color-status-done;
  }
}
</style>
