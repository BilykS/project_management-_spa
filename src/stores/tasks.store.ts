// GRASP Information Expert: store знає всі завдання → він відповідає
// за групування і фільтрацію.
// GRASP Creator: store агрегує Task[] → він створює нові завдання.
// GRASP Low Coupling: TasksTable і TaskKanban незалежні — обидва
// читають з одного store замість прямої залежності між собою.
// SRP: тільки стан завдань і CRUD-операції над ними.

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { tasksApi } from '@/api/tasks.api'
import { useProjectsStore } from './projects.store'
import type { Task, CreateTaskDto, UpdateTaskDto, TaskStatus } from '@/types/models'

export const useTasksStore = defineStore(
  'tasks',
  () => {
    // ─── State ──────────────────────────────────────────────────────────────
    const tasks   = ref<Task[]>([])
    const loading = ref(false)
    const error   = ref<string | null>(null)

    // ─── Getters ────────────────────────────────────────────────────────────

    // Information Expert: store знає tasks → він відповідає за вибірку
    // Повертає функцію — дозволяє реактивно отримати завдання по projectId
    const byProject = computed(() => {
      return (projectId: number): Task[] =>
        tasks.value
          .filter((t) => t.projectId === projectId)
          .sort((a, b) => a.order - b.order)
    })

    // Для Kanban: повертає завдання проекту згруповані по статусу
    // GRASP High Cohesion: вся логіка групування живе тут, не в компоненті
    const byStatus = computed(() => {
      return (projectId: number): Record<TaskStatus, Task[]> => {
        const projectTasks = tasks.value
          .filter((t) => t.projectId === projectId)
          .sort((a, b) => a.order - b.order)

        return {
          'todo':        projectTasks.filter((t) => t.status === 'todo'),
          'in-progress': projectTasks.filter((t) => t.status === 'in-progress'),
          'done':        projectTasks.filter((t) => t.status === 'done'),
        }
      }
    })

    // ─── Private helpers ────────────────────────────────────────────────────

    function setLoading(value: boolean)      { loading.value = value }
    function setError(msg: string | null)    { error.value   = msg   }

    // ─── Actions ────────────────────────────────────────────────────────────

    async function fetchByProject(projectId: number): Promise<void> {
      setLoading(true)
      setError(null)
      try {
        const { data } = await tasksApi.getByProject(projectId)
        // Зберігаємо отримані завдання, попередньо прибравши старі для цього проекту
        tasks.value = [
          ...tasks.value.filter((t) => t.projectId !== projectId),
          ...data,
        ]
      } catch {
        setError('Failed to load tasks.')
      } finally {
        setLoading(false)
      }
    }

    async function create(dto: CreateTaskDto): Promise<Task> {
      setError(null)
      const projectTasks = byProject.value(dto.projectId)
      const nextOrder    = projectTasks.length + 1

      const payload: Omit<Task, 'id'> = {
        ...dto,
        order: nextOrder,
        createdAt: new Date().toISOString(),
      }

      const { data } = await tasksApi.create(payload)
      // Optimistic: додаємо без refetch
      tasks.value.push(data)

      // GRASP Indirection: оновлюємо taskCount через projects store
      const projectsStore = useProjectsStore()
      projectsStore.adjustTaskCount(dto.projectId, +1)

      return data
    }

    async function update(id: number, dto: UpdateTaskDto): Promise<Task> {
      setError(null)
      const existing = tasks.value.find((t) => t.id === id)
      if (!existing) throw new Error(`Task ${id} not found`)

      const { data } = await tasksApi.update(id, { ...existing, ...dto })
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) tasks.value[index] = data
      return data
    }

    async function remove(id: number): Promise<void> {
      setError(null)
      const task = tasks.value.find((t) => t.id === id)
      if (!task) return

      await tasksApi.remove(id)
      // Optimistic: видаляємо без refetch
      tasks.value = tasks.value.filter((t) => t.id !== id)

      // GRASP Indirection: зменшуємо taskCount через projects store
      const projectsStore = useProjectsStore()
      projectsStore.adjustTaskCount(task.projectId, -1)
    }

    // Викликається після drag-and-drop в таблиці або Kanban.
    // Отримує вже переставлений масив завдань конкретного проекту,
    // перераховує order і персистує кожну змінену задачу через API.
    async function reorder(reorderedTasks: Task[]): Promise<void> {
      setError(null)
      // Перераховуємо order на основі нових позицій
      const updated = reorderedTasks.map((task, index) => ({
        ...task,
        order: index + 1,
      }))

      // Оновлюємо локальний стан одразу (optimistic)
      updated.forEach((updatedTask) => {
        const index = tasks.value.findIndex((t) => t.id === updatedTask.id)
        if (index !== -1) tasks.value[index] = updatedTask
      })

      // Персистуємо тільки ті задачі, у яких order змінився
      const changed = updated.filter((t, i) => t.order !== reorderedTasks[i]?.order)
      await Promise.all(
        changed.map((t) => tasksApi.update(t.id, { order: t.order })),
      )
    }

    // ────────────────────────────────────────────────────────────────────────
    return {
      // state
      tasks,
      loading,
      error,
      // getters
      byProject,
      byStatus,
      // actions
      fetchByProject,
      create,
      update,
      remove,
      reorder,
    }
  },
  {
    // Persist тільки tasks — loading/error не зберігаємо
    persist: { paths: ['tasks'] },
  },
)
