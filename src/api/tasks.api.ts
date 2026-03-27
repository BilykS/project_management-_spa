import apiClient from './client'
import { createApiResource } from './createApiResource'
import type { Task, CreateTaskDto, UpdateTaskDto, TasksFilterParams } from '@/types/models'

const BASE = '/tasks'
const base = createApiResource<Task, CreateTaskDto, UpdateTaskDto>(BASE)

export const tasksApi = {
  ...base,

  getByProject(projectId: number, params?: TasksFilterParams): Promise<{ data: Task[] }> {
    const query: Record<string, string | number> = { projectId, _sort: 'order', _order: 'asc' }
    if (params?.assignee) query['assignee_like'] = params.assignee
    if (params?.status)   query['status']        = params.status
    return apiClient.get<Task[]>(BASE, { params: query })
  },
}
