// SRP: тільки HTTP-операції над /tasks.
// DIP: використовує apiClient, а не axios напряму.
// DRY: всі URL-рядки завдань централізовані тут.

import apiClient from './client'
import type { Task, CreateTaskDto, UpdateTaskDto } from '@/types/models'

const BASE = '/tasks'

export const tasksApi = {
  getByProject(projectId: number): Promise<{ data: Task[] }> {
    return apiClient.get<Task[]>(BASE, {
      params: { projectId, _sort: 'order', _order: 'asc' },
    })
  },

  getById(id: number): Promise<{ data: Task }> {
    return apiClient.get<Task>(`${BASE}/${id}`)
  },

  create(dto: CreateTaskDto): Promise<{ data: Task }> {
    return apiClient.post<Task>(BASE, dto)
  },

  update(id: number, dto: UpdateTaskDto): Promise<{ data: Task }> {
    return apiClient.put<Task>(`${BASE}/${id}`, dto)
  },

  remove(id: number): Promise<void> {
    return apiClient.delete(`${BASE}/${id}`)
  },
}
