import apiClient from './client'
import { createApiResource } from './createApiResource'
import type { Project, CreateProjectDto, UpdateProjectDto, ProjectsFilterParams } from '@/types/models'

const BASE = '/projects'
const base = createApiResource<Project, CreateProjectDto, UpdateProjectDto>(BASE)

export const projectsApi = {
  ...base,

  getAll(params?: ProjectsFilterParams): Promise<{ data: Project[] }> {
    const query: Record<string, string> = {}
    if (params?.name)   query['name_like']   = params.name
    if (params?.status) query['status'] = params.status
    return apiClient.get<Project[]>(BASE, { params: query })
  },

  patch(id: number, dto: Partial<Project>): Promise<{ data: Project }> {
    return apiClient.patch<Project>(`${BASE}/${id}`, dto)
  },
}
