<template>
  <div class="task-kanban">

    <!-- Header -->
    <div class="kanban-header">
      <AppButton variant="primary" @click="openCreate">+ Додати завдання</AppButton>
    </div>

    <!-- Loading -->
    <div v-if="tasksStore.loading" class="state-box">
      <AppSpinner size="lg" />
    </div>

    <!-- Board -->
    <div v-else class="kanban-board">
      <KanbanColumn
        v-model="localTodo"
        status="todo"
        @drop="onDrop"
        @edit="openEdit"
      />
      <KanbanColumn
        v-model="localInProgress"
        status="in-progress"
        @drop="onDrop"
        @edit="openEdit"
      />
      <KanbanColumn
        v-model="localDone"
        status="done"
        @drop="onDrop"
        @edit="openEdit"
      />
    </div>

    <!-- Modal -->
    <AppModal v-model="showModal" :title="editingTask ? 'Редагувати завдання' : 'Додати завдання'">
      <TaskForm
        :project-id="projectId"
        :task="editingTask ?? undefined"
        @saved="showModal = false"
        @cancel="showModal = false"
      />
    </AppModal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTasksStore } from '@/stores/tasks.store'
import type { Task, TaskStatus } from '@/types/models'
import AppButton  from '@/components/base/AppButton.vue'
import AppSpinner from '@/components/base/AppSpinner.vue'
import AppModal   from '@/components/base/AppModal.vue'
import KanbanColumn from './KanbanColumn.vue'
import TaskForm     from './TaskForm.vue'

const props = defineProps<{
  projectId: number
}>()

const tasksStore = useTasksStore()

const localTodo       = ref<Task[]>([])
const localInProgress = ref<Task[]>([])
const localDone       = ref<Task[]>([])

const showModal   = ref(false)
const editingTask = ref<Task | null>(null)

const byStatus = computed(() => tasksStore.byStatus(props.projectId))

// Sync local arrays from store (after store updates or on mount)
watch(byStatus, (val) => {
  localTodo.value       = [...val.todo]
  localInProgress.value = [...val['in-progress']]
  localDone.value       = [...val.done]
}, { immediate: true })

async function onDrop(): Promise<void> {
  // Snapshot all changes synchronously before any await
  const columns: [TaskStatus, Task[]][] = [
    ['todo',        localTodo.value],
    ['in-progress', localInProgress.value],
    ['done',        localDone.value],
  ]

  const updates: { id: number; dto: { status: TaskStatus; order: number } }[] = []

  for (const [status, tasks] of columns) {
    tasks.forEach((task, i) => {
      const newOrder = i + 1
      if (task.status !== status || task.order !== newOrder) {
        updates.push({ id: task.id, dto: { status, order: newOrder } })
      }
    })
  }

  await Promise.all(updates.map(({ id, dto }) => tasksStore.update(id, dto)))
}

function openCreate(): void {
  editingTask.value = null
  showModal.value   = true
}

function openEdit(task: Task): void {
  editingTask.value = task
  showModal.value   = true
}
</script>

<style scoped lang="scss">
.task-kanban {
  @include flex-column;
  gap: $spacing-4;
}

.kanban-header {
  @include flex-between;
}

.state-box {
  @include flex-center;
  min-height: 300px;
}

.kanban-board {
  display: flex;
  align-items: flex-start;
  gap: $spacing-4;
  overflow-x: auto;
  padding-bottom: $spacing-4;
  @include custom-scrollbar;
}
</style>
