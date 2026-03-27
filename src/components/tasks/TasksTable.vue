<template>
  <div class="tasks-table">

    <!-- Toolbar -->
    <TableToolbar
      :search-value="uiStore.tasksFilter.assignee"
      :status-value="uiStore.tasksFilter.status"
      search-placeholder="Пошук за виконавцем…"
      :status-options="TASK_STATUSES"
      @update:search-value="uiStore.setTasksFilter({ assignee: $event })"
      @update:status-value="uiStore.setTasksFilter({ status: $event as TaskStatus | '' })"
    >
      <AppButton variant="primary" @click="openCreate">+ Додати завдання</AppButton>
    </TableToolbar>

    <!-- Loading -->
    <div v-if="tasksStore.loading" class="state-box">
      <AppSpinner size="lg" />
    </div>

    <!-- Error -->
    <div v-else-if="tasksStore.error" class="state-box state-box--error">
      <p>{{ tasksStore.error }}</p>
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
import { useDraggableList } from '@/composables/useDraggableList'
import { GripVertical, Pencil, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-vue-next'
import { formatDate } from '@/utils/dateUtils'
import { TASK_COLUMNS } from '@/config/tableColumns'
import { VueDraggable } from 'vue-draggable-plus'
import { useTasksStore } from '@/stores/tasks.store'
import { useUiStore } from '@/stores/ui.store'
import { useSort } from '@/composables/useSort'
import { useDebounce } from '@/composables/useDebounce'
import { useResizableColumns } from '@/composables/useResizableColumns'
import { TASK_STATUSES } from '@/types/models'
import type { Task, TaskStatus } from '@/types/models'
import AppButton  from '@/components/base/AppButton.vue'
import AppSpinner from '@/components/base/AppSpinner.vue'
import AppBadge   from '@/components/base/AppBadge.vue'
import AppModal   from '@/components/base/AppModal.vue'
import TaskForm      from './TaskForm.vue'
import TableToolbar  from '@/components/base/TableToolbar.vue'

const props = defineProps<{
  projectId: number
}>()

const tasksStore = useTasksStore()
const uiStore    = useUiStore()
const resizable  = useResizableColumns('task')

const showModal   = ref(false)
const editingTask = ref<Task | null>(null)

const columns = TASK_COLUMNS

const tasksRef     = computed(() => tasksStore.byProject(props.projectId) as unknown as Record<string, unknown>[])
const sortStateRef = computed(() => uiStore.tasksSort)
const { sorted }   = useSort(tasksRef, sortStateRef)

const displayedTasks  = computed(() => sorted.value as unknown as Task[])
const allProjectTasks = computed(() => tasksStore.byProject(props.projectId))
const localTasks      = useDraggableList(displayedTasks)

function fetchWithFilters(): void {
  const { assignee, status } = uiStore.tasksFilter
  tasksStore.fetchByProject(props.projectId, {
    assignee: assignee || undefined,
    status:   status   || undefined,
  })
}

const debouncedFetch = useDebounce(fetchWithFilters)

watch(() => uiStore.tasksFilter.assignee, () => debouncedFetch())
watch(() => uiStore.tasksFilter.status,   () => fetchWithFilters())

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

onMounted(() => {
  fetchWithFilters()
})
</script>

<style scoped lang="scss">
.tasks-table {
  @include flex-column;
  gap: $spacing-4;
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

  &--error p {
    color: $color-danger;
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
    &--actions { @include flex-end; gap: $spacing-1; }
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
