import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { projectsApi } from '@/api/projects.api'
import type { Project, CreateProjectDto, UpdateProjectDto, ProjectsFilterParams } from '@/types/models'

export const useProjectsStore = defineStore(
  'projects',
  () => {
    const projects = ref<Project[]>([])
    const loading  = ref(false)
    const error    = ref<string | null>(null)

    // Task counts grouped by project status, used for chart
    const taskStatsByStatus = computed(() =>
      projects.value.reduce(
        (acc, project) => {
          acc[project.status] = (acc[project.status] ?? 0) + project.taskCount
          return acc
        },
        {} as Record<string, number>,
      ),
    )

    const totalTaskCount = computed(() =>
      projects.value.reduce((sum, p) => sum + p.taskCount, 0),
    )

    function setLoading(value: boolean)     { loading.value = value }
    function setError(msg: string | null)   { error.value   = msg   }

    async function fetchAll(params?: ProjectsFilterParams): Promise<void> {
      setLoading(true)
      setError(null)
      try {
        const { data } = await projectsApi.getAll(params)
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
      projects.value = projects.value.filter((p) => p.id !== id)
    }

    // Called by tasks store to keep taskCount in sync
    async function adjustTaskCount(projectId: number, delta: number): Promise<void> {
      const project = projects.value.find((p) => p.id === projectId)
      if (!project) return
      const newCount = Math.max(0, project.taskCount + delta)
      project.taskCount = newCount
      await projectsApi.patch(projectId, { taskCount: newCount })
    }

    return {
      projects,
      loading,
      error,
      taskStatsByStatus,
      totalTaskCount,
      fetchAll,
      create,
      update,
      remove,
      adjustTaskCount,
    }
  },
  { persist: { paths: ['projects'] } },
)
