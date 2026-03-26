import apiClient from './client'
import { createApiResource } from './createApiResource'
import type { Task, CreateTaskDto, UpdateTaskDto } from '@/types/models'

const BASE = '/tasks'
const base = createApiResource<Task, CreateTaskDto, UpdateTaskDto>(BASE)

export const tasksApi = {
  ...base,

  getByProject(projectId: number): Promise<{ data: Task[] }> {
    return apiClient.get<Task[]>(BASE, {
      params: { projectId, _sort: 'order', _order: 'asc' },
    })
  },
}
