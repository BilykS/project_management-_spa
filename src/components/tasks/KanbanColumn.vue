<template>
  <div class="kanban-col">
    <div class="kanban-col__header">
      <AppBadge :status="status" />
      <span class="kanban-col__count">{{ modelValue.length }}</span>
    </div>
    <VueDraggable
      v-model="model"
      :group="{ name: 'kanban' }"
      :animation="200"
      class="kanban-col__list"
      @end="emit('drop')"
    >
      <TaskCard
        v-for="task in model"
        :key="task.id"
        :task="task"
        @edit="emit('edit', $event)"
      />
    </VueDraggable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { Task, TaskStatus } from '@/types/models'
import AppBadge from '@/components/base/AppBadge.vue'
import TaskCard from './TaskCard.vue'

const props = defineProps<{
  modelValue: Task[]
  status: TaskStatus
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Task[]]
  drop: []
  edit: [task: Task]
}>()

// Writable computed bridges v-model prop ↔ VueDraggable's internal mutations
const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<style scoped lang="scss">
.kanban-col {
  @include flex-column;
  gap: $spacing-3;
  flex: 1;
  min-width: 260px;
  max-width: 360px;
  min-height: 0;

  &__header {
    @include flex-between;
    padding: $spacing-1;
    flex-shrink: 0;
  }

  &__count {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: $color-text-secondary;
    background: $color-bg-primary;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    padding: 2px $spacing-2;
  }

  &__list {
    @include flex-column;
    gap: $spacing-2;
    flex: 1;
    min-height: 80px;
    overflow-y: auto;
    padding: $spacing-2;
    border-radius: $radius-lg;
    background: $color-bg-secondary;
    border: 2px dashed transparent;
    transition: border-color $transition-fast, background $transition-fast;
    @include custom-scrollbar;
  }
}
</style>
