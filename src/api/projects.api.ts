// SRP: тільки HTTP-операції над /projects.
// DIP: використовує apiClient, а не axios напряму.
// DRY: всі URL-рядки проектів централізовані тут.

import apiClient from './client'
import type { Project, CreateProjectDto, UpdateProjectDto } from '@/types/models'

const BASE = '/projects'

export const projectsApi = {
  getAll(): Promise<{ data: Project[] }> {
    return apiClient.get<Project[]>(BASE)
  },

  getById(id: number): Promise<{ data: Project }> {
    return apiClient.get<Project>(`${BASE}/${id}`)
  },

  create(dto: CreateProjectDto): Promise<{ data: Project }> {
    return apiClient.post<Project>(BASE, dto)
  },

  update(id: number, dto: UpdateProjectDto): Promise<{ data: Project }> {
    return apiClient.put<Project>(`${BASE}/${id}`, dto)
  },

  remove(id: number): Promise<void> {
    return apiClient.delete(`${BASE}/${id}`)
  },
}
