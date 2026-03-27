import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { tasksApi } from '@/api/tasks.api'
import { useProjectsStore } from './projects.store'
import type { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TasksFilterParams } from '@/types/models'

export const useTasksStore = defineStore(
  'tasks',
  () => {
    const tasks   = ref<Task[]>([])
    const loading = ref(false)
    const error   = ref<string | null>(null)

    // Returns a function — allows reactive lookup by projectId
    const byProject = computed(() => {
      return (projectId: number): Task[] =>
        tasks.value
          .filter((t) => t.projectId === projectId)
          .sort((a, b) => a.order - b.order)
    })

    // Tasks for a project grouped by status, for Kanban view
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

    function setLoading(value: boolean)    { loading.value = value }
    function setError(msg: string | null)  { error.value   = msg   }

    async function fetchByProject(projectId: number, params?: TasksFilterParams): Promise<void> {
      setLoading(true)
      setError(null)
      try {
        const { data } = await tasksApi.getByProject(projectId, params)
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
      tasks.value.push(data)

      const projectsStore = useProjectsStore()
      await projectsStore.adjustTaskCount(dto.projectId, +1)

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
      tasks.value = tasks.value.filter((t) => t.id !== id)

      const projectsStore = useProjectsStore()
      await projectsStore.adjustTaskCount(task.projectId, -1)
    }

    // Receives reordered array, recalculates order and patches only changed tasks
    async function reorder(reorderedTasks: Task[]): Promise<void> {
      setError(null)
      const updated = reorderedTasks.map((task, index) => ({
        ...task,
        order: index + 1,
      }))

      updated.forEach((updatedTask) => {
        const index = tasks.value.findIndex((t) => t.id === updatedTask.id)
        if (index !== -1) tasks.value[index] = updatedTask
      })

      const changed = updated.filter((t, i) => t.order !== reorderedTasks[i]?.order)
      await Promise.all(
        changed.map(({ id, createdAt, ...dto }) => tasksApi.update(id, dto as UpdateTaskDto)),
      )
    }

    return {
      tasks,
      loading,
      error,
      byProject,
      byStatus,
      fetchByProject,
      create,
      update,
      remove,
      reorder,
    }
  },
  { persist: { paths: ['tasks'] } },
)
