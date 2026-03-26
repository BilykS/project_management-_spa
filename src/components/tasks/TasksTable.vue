<template>
  <div class="tasks-table">

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar__filters">
        <input
          :value="uiStore.tasksFilter.assignee"
          class="filter-input"
          type="search"
          placeholder="Пошук за виконавцем…"
          @input="uiStore.setTasksFilter({ assignee: ($event.target as HTMLInputElement).value })"
        />
        <div class="select-wrapper">
          <select
            :value="uiStore.tasksFilter.status"
            class="filter-select"
            @change="onStatusChange"
          >
            <option value="">Всі статуси</option>
            <option v-for="s in TASK_STATUSES" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
          <ChevronDown :size="14" class="select-wrapper__icon" />
        </div>
      </div>
      <AppButton variant="primary" @click="openCreate">+ Додати завдання</AppButton>
    </div>

    <!-- Loading -->
    <div v-if="tasksStore.loading" class="state-box">
      <AppSpinner size="lg" />
    </div>

    <!-- Empty -->
    <div v-else-if="displayedTasks.length === 0" class="state-box state-box--empty">
      <p>{{ allProjectTasks.length === 0 ? 'Немає завдань. Додайте перше!' : 'Жодне завдання не відповідає фільтрам.' }}</p>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              v-resize-column="resizable.getBinding(col.key)"
              class="table__th"
              :class="{
                'table__th--sorted': uiStore.tasksSort.key === col.key,
              }"
            >
              <span class="th-content">
                {{ col.label }}
                <span v-if="col.sortable" class="sort-icon" @click.stop="uiStore.setTasksSort(col.key)">
                  <ChevronUp v-if="uiStore.tasksSort.key === col.key && uiStore.tasksSort.direction === 'asc'" :size="12" />
                  <ChevronDown v-else-if="uiStore.tasksSort.key === col.key" :size="12" />
                  <ChevronsUpDown v-else :size="12" />
                </span>
              </span>
            </th>
          </tr>
        </thead>
        <VueDraggable
          v-model="localTasks"
          tag="tbody"
          :animation="200"
          handle=".drag-handle"
          @end="onDragEnd"
        >
          <tr v-for="task in localTasks" :key="task.id" class="table__row">
            <td class="table__td table__td--drag">
              <span class="drag-handle"><GripVertical :size="16" /></span>
            </td>
            <td class="table__td">{{ task.id }}</td>
            <td class="table__td table__td--title">{{ task.title }}</td>
            <td class="table__td">{{ task.assignee ?? '—' }}</td>
            <td class="table__td"><AppBadge :status="task.status" /></td>
            <td class="table__td">{{ task.dueDate ? formatDate(task.dueDate) : '—' }}</td>
            <td class="table__td table__td--actions">
              <button class="btn-icon" title="Редагувати" @click.stop="openEdit(task)"><Pencil :size="14" /></button>
            </td>
          </tr>
        </VueDraggable>
      </table>
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
import { ref, computed, watch, onMounted } from 'vue'
import { GripVertical, Pencil, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-vue-next'
import { VueDraggable } from 'vue-draggable-plus'
import { useTasksStore } from '@/stores/tasks.store'
import { useUiStore } from '@/stores/ui.store'
import { useSort } from '@/composables/useSort'
import { useFilter } from '@/composables/useFilter'
import { useResizableColumns } from '@/composables/useResizableColumns'
import { TASK_STATUSES } from '@/types/models'
import type { Task, TaskStatus } from '@/types/models'
import AppButton  from '@/components/base/AppButton.vue'
import AppSpinner from '@/components/base/AppSpinner.vue'
import AppBadge   from '@/components/base/AppBadge.vue'
import AppModal   from '@/components/base/AppModal.vue'
import TaskForm   from './TaskForm.vue'

const props = defineProps<{
  projectId: number
}>()

const tasksStore = useTasksStore()
const uiStore    = useUiStore()
const resizable  = useResizableColumns('task')

const showModal   = ref(false)
const editingTask = ref<Task | null>(null)

const columns = [
  { key: 'drag',     label: '',                   sortable: false },
  { key: 'id',       label: 'ID',                 sortable: true  },
  { key: 'title',    label: 'Назва завдання',     sortable: true  },
  { key: 'assignee', label: 'Виконавець',         sortable: true  },
  { key: 'status',   label: 'Статус',             sortable: true  },
  { key: 'dueDate',  label: 'Термін виконання',   sortable: true  },
  { key: 'actions',  label: '',                   sortable: false },
]

// Sort + filter pipeline (same pattern as ProjectsTable)
const tasksRef     = computed(() => tasksStore.byProject(props.projectId) as unknown as Record<string, unknown>[])
const sortStateRef = computed(() => uiStore.tasksSort)

const { sorted } = useSort(tasksRef, sortStateRef)

const filtersRef = computed<Record<string, string>>(() => ({
  assignee: uiStore.tasksFilter.assignee,
  status:   uiStore.tasksFilter.status,
}))

const { filtered } = useFilter(sorted, filtersRef, {
  assignee: 'text',
  status:   'exact',
})

const displayedTasks  = computed(() => filtered.value as unknown as Task[])
const allProjectTasks = computed(() => tasksStore.byProject(props.projectId))

// VueDraggable requires a mutable ref — keep it synced with displayedTasks
const localTasks = ref<Task[]>([])

watch(displayedTasks, (val) => {
  localTasks.value = [...val]
}, { immediate: true })

function onStatusChange(e: Event): void {
  const select = e.target as HTMLSelectElement
  uiStore.setTasksFilter({ status: select.value as TaskStatus | '' })
  select.blur()
}

function onDragEnd(): void {
  tasksStore.reorder(localTasks.value)
}

function openCreate(): void {
  editingTask.value = null
  showModal.value   = true
}

function openEdit(task: Task): void {
  editingTask.value = task
  showModal.value   = true
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// fetch only if no tasks for this project yet (persist may already have data)
onMounted(() => {
  if (tasksStore.byProject(props.projectId).length === 0) {
    tasksStore.fetchByProject(props.projectId)
  }
})
</script>

<style scoped lang="scss">
.tasks-table {
  @include flex-column;
  gap: $spacing-4;
}

.toolbar {
  @include flex-between;
  gap: $spacing-4;
  flex-wrap: wrap;

  &__filters {
    @include flex-start;
    gap: $spacing-3;
    flex: 1;
    min-width: 0;
  }
}

.filter-input,
.filter-select {
  padding: $spacing-2 $spacing-3;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  color: $color-text-primary;
  background: $color-bg-primary;
  outline: none;
  transition: border-color $transition-fast, box-shadow $transition-fast;

  &:focus {
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba($color-primary, 0.12);
  }
}

.filter-input  { width: 200px; }
.filter-select {
  width: 150px;
  cursor: pointer;
  appearance: none;
  padding-right: $spacing-8;
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

.state-box {
  @include flex-center;
  min-height: 200px;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  background: $color-bg-primary;

  &--empty p {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  background: $color-bg-primary;
  @include custom-scrollbar;
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  &__th {
    padding: $spacing-3 $spacing-4;
    background: $color-bg-secondary;
    border-bottom: 2px solid $color-border;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: $color-text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
    position: relative;
    overflow: hidden;

    &--sorted { color: $color-primary; }
  }

  &__row {
    transition: background $transition-fast;
    &:hover { background: $color-bg-hover; }
    &:not(:last-child) td { border-bottom: 1px solid $color-border; }
  }

  &__td {
    padding: $spacing-3 $spacing-4;
    font-size: $font-size-sm;
    color: $color-text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &--drag    { cursor: grab; width: 40px; text-align: center; }
    &--title   { font-weight: $font-weight-medium; }
    &--actions { @include flex-start; gap: $spacing-1; }
  }
}

.th-content {
  @include flex-start;
  gap: $spacing-2;
}

.sort-icon {
  @include flex-center;
  color: $color-text-muted;
  flex-shrink: 0;
  cursor: pointer;
  padding: 2px;
  border-radius: $radius-sm;
  transition: background $transition-fast, color $transition-fast;

  &:hover { background: $color-bg-hover; color: $color-text-primary; }
  .table__th--sorted & { color: $color-primary; }
}

.drag-handle {
  @include flex-center;
  color: $color-text-muted;
  cursor: grab;
  user-select: none;

  &:active { cursor: grabbing; }
}

.btn-icon {
  @include flex-center;
  width: 28px;
  height: 28px;
  border-radius: $radius-md;
  border: none;
  background: transparent;
  color: $color-text-secondary;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: background $transition-fast, color $transition-fast;
  flex-shrink: 0;

  &:hover {
    background: $color-bg-hover;
    color: $color-text-primary;
  }

  &--danger:hover {
    background: rgba($color-danger, 0.1);
    color: $color-danger;
  }
}
</style>
