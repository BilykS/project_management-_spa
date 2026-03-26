<template>
  <div class="task-card">
    <div class="task-card__header">
      <p class="task-card__title">{{ task.title }}</p>
      <button class="task-card__edit" @click.stop="emit('edit', task)"><Pencil :size="13" /></button>
    </div>
    <div class="task-card__footer">
      <span v-if="task.assignee" class="task-card__assignee">{{ task.assignee }}</span>
      <AppBadge :status="task.status" class="task-card__footer-bage"/>
    </div>
    <p v-if="task.dueDate" class="task-card__due">{{ formatDate(task.dueDate) }}</p>
  </div>
</template>

<script setup lang="ts">
import { Pencil } from 'lucide-vue-next'
import type { Task } from '@/types/models'
import AppBadge from '@/components/base/AppBadge.vue'
import { formatDate } from '@/utils/dateUtils'

const props = defineProps<{ task: Task }>()
const emit  = defineEmits<{ edit: [task: Task] }>()

</script>

<style scoped lang="scss">
.task-card {
  @include card;
  padding: $spacing-3;
  cursor: grab;
  transition: box-shadow $transition-fast;

  &:hover  { box-shadow: $shadow-md; }
  &:active { cursor: grabbing; }

  &__header {
    @include flex-between;
    gap: $spacing-2;
    margin-bottom: $spacing-2;
  }

  &__title {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-primary;
    line-height: $line-height-normal;
    @include text-clamp(2);
  }

  &__edit {
    @include button-reset;
    @include flex-center;
    width: 26px;
    height: 26px;
    border-radius: $radius-sm;
    color: $color-text-muted;
    flex-shrink: 0;
    transition: background $transition-fast, color $transition-fast;

    &:hover {
      background: $color-bg-hover;
      color: $color-text-primary;
    }
  }

  &__footer {
    @include flex-between;
    gap: $spacing-2;
  }

  &__footer-bage {
    margin-left: auto;
  }

  &__assignee {
    font-size: $font-size-xs;
    color: $color-text-secondary;
    @include text-truncate;
    flex: 1;
    min-width: 0;
  }

  &__due {
    font-size: $font-size-xs;
    color: $color-text-muted;
    margin-top: $spacing-2;
  }

  
}
</style>
