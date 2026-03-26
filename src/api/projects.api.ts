import apiClient from './client'
import { createApiResource } from './createApiResource'
import type { Project, CreateProjectDto, UpdateProjectDto } from '@/types/models'

const BASE = '/projects'
const base = createApiResource<Project, CreateProjectDto, UpdateProjectDto>(BASE)

export const projectsApi = {
  ...base,

  getAll(): Promise<{ data: Project[] }> {
    return apiClient.get<Project[]>(BASE)
  },

  patch(id: number, dto: Partial<Project>): Promise<{ data: Project }> {
    return apiClient.patch<Project>(`${BASE}/${id}`, dto)
  },
}
