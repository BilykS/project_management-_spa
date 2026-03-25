// GRASP High Cohesion: весь UI-стан (viewMode, sort, filter, column widths)
// в одному місці — не розкиданий по компонентах.
// Protected Variations: компоненти читають ui-стан через store,
// тому зміна структури стану торкнеться тільки цього файлу.
// SRP: тільки UI preferences — жодних API-викликів.

import { ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  SortState,
  ProjectsFilterState,
  TasksFilterState,
} from '@/types/models'

export const useUiStore = defineStore(
  'ui',
  () => {
    // ─── View mode ──────────────────────────────────────────────────────────
    // Зберігається між перезавантаженнями (spec requirement)
    const viewMode = ref<'table' | 'kanban'>('table')

    // ─── Projects table state ────────────────────────────────────────────────
    const projectsSort = ref<SortState>({
      key: 'id',
      direction: 'asc',
    })

    const projectsFilter = ref<ProjectsFilterState>({
      name: '',
      status: '',
    })

    // ─── Tasks table state ───────────────────────────────────────────────────
    const tasksSort = ref<SortState>({
      key: 'order',
      direction: 'asc',
    })

    const tasksFilter = ref<TasksFilterState>({
      assignee: '',
      status: '',
    })

    // ─── Column widths ────────────────────────────────────────────────────────
    // DRY: зберігаються один раз тут, зчитуються директивою vResizeColumn
    const projectColumnWidths = ref<Record<string, number>>({
      id:        60,
      name:      220,
      taskCount: 130,
      status:    120,
      createdAt: 160,
    })

    const taskColumnWidths = ref<Record<string, number>>({
      drag:      40,
      id:        60,
      title:     240,
      assignee:  160,
      status:    130,
      dueDate:   140,
      actions:   90,
    })

    // ─── Actions ─────────────────────────────────────────────────────────────

    function setViewMode(mode: 'table' | 'kanban'): void {
      viewMode.value = mode
    }

    function setProjectsSort(key: string): void {
      if (projectsSort.value.key === key) {
        projectsSort.value.direction =
          projectsSort.value.direction === 'asc' ? 'desc' : 'asc'
      } else {
        projectsSort.value = { key, direction: 'asc' }
      }
    }

    function setTasksSort(key: string): void {
      if (tasksSort.value.key === key) {
        tasksSort.value.direction =
          tasksSort.value.direction === 'asc' ? 'desc' : 'asc'
      } else {
        tasksSort.value = { key, direction: 'asc' }
      }
    }

    function setProjectsFilter(patch: Partial<ProjectsFilterState>): void {
      projectsFilter.value = { ...projectsFilter.value, ...patch }
    }

    function setTasksFilter(patch: Partial<TasksFilterState>): void {
      tasksFilter.value = { ...tasksFilter.value, ...patch }
    }

    function setProjectColumnWidth(col: string, width: number): void {
      projectColumnWidths.value[col] = width
    }

    function setTaskColumnWidth(col: string, width: number): void {
      taskColumnWidths.value[col] = width
    }

    // ─────────────────────────────────────────────────────────────────────────
    return {
      // state
      viewMode,
      projectsSort,
      projectsFilter,
      tasksSort,
      tasksFilter,
      projectColumnWidths,
      taskColumnWidths,
      // actions
      setViewMode,
      setProjectsSort,
      setTasksSort,
      setProjectsFilter,
      setTasksFilter,
      setProjectColumnWidth,
      setTaskColumnWidth,
    }
  },
  {
    // Persist все — viewMode, sort, filter, column widths (spec requirement)
    persist: true,
  },
)
