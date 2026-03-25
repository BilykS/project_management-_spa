// GRASP Information Expert: store знає всі проекти → він відповідає
// за будь-яку логіку над ними.
// GRASP Creator: store агрегує Project[] → він створює нові проекти.
// GRASP Controller: посередник між UI і API — компонент лише викликає actions.
// SRP: тільки стан проектів і CRUD-операції над ними.

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { projectsApi } from '@/api/projects.api'
import type { Project, CreateProjectDto, UpdateProjectDto } from '@/types/models'

export const useProjectsStore = defineStore(
  'projects',
  () => {
    // ─── State ──────────────────────────────────────────────────────────────
    const projects = ref<Project[]>([])
    const loading  = ref(false)
    const error    = ref<string | null>(null)

    // ─── Getters ────────────────────────────────────────────────────────────

    // Information Expert: store знає проекти → він рахує статистику для chart
    const taskStatsByStatus = computed(() => {
      return projects.value.reduce(
        (acc, project) => {
          acc[project.status] = (acc[project.status] ?? 0) + project.taskCount
          return acc
        },
        {} as Record<string, number>,
      )
    })

    const totalTaskCount = computed(() =>
      projects.value.reduce((sum, p) => sum + p.taskCount, 0),
    )

    // ─── Private helpers ────────────────────────────────────────────────────

    function setLoading(value: boolean) {
      loading.value = value
    }

    function setError(message: string | null) {
      error.value = message
    }

    // ─── Actions ────────────────────────────────────────────────────────────

    // DIP: action викликає API модуль, не axios напряму
    async function fetchAll(): Promise<void> {
      setLoading(true)
      setError(null)
      try {
        const { data } = await projectsApi.getAll()
        projects.value = data
      } catch {
        setError('Failed to load projects.')
      } finally {
        setLoading(false)
      }
    }

    async function create(dto: CreateProjectDto): Promise<Project> {
      setError(null)
      const payload: Omit<Project, 'id'> = {
        ...dto,
        status: 'active',
        taskCount: 0,
        createdAt: new Date().toISOString(),
      }
      const { data } = await projectsApi.create(payload)
      // Optimistic: додаємо у локальний масив без refetch
      projects.value.push(data)
      return data
    }

    async function update(id: number, dto: UpdateProjectDto): Promise<Project> {
      setError(null)
      const { data } = await projectsApi.update(id, dto)
      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) projects.value[index] = data
      return data
    }

    async function remove(id: number): Promise<void> {
      setError(null)
      await projectsApi.remove(id)
      // Optimistic: видаляємо локально без refetch
      projects.value = projects.value.filter((p) => p.id !== id)
    }

    // GRASP Indirection: tasks store викликає цей метод замість прямого
    // патчингу projects — єдина точка зміни taskCount
    function adjustTaskCount(projectId: number, delta: number): void {
      const project = projects.value.find((p) => p.id === projectId)
      if (project) {
        project.taskCount = Math.max(0, project.taskCount + delta)
      }
    }

    // ────────────────────────────────────────────────────────────────────────
    return {
      // state
      projects,
      loading,
      error,
      // getters
      taskStatsByStatus,
      totalTaskCount,
      // actions
      fetchAll,
      create,
      update,
      remove,
      adjustTaskCount,
    }
  },
  {
    // Persist тільки projects — loading/error не зберігаємо
    persist: { paths: ['projects'] },
  },
)
