export type ProjectStatus = 'active' | 'completed' | 'on-hold'
export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface Project {
  id: number
  name: string
  description: string
  status: ProjectStatus
  taskCount: number
  createdAt: string // ISO 8601
}

export interface Task {
  id: number
  projectId: number
  title: string           // 3–120 chars
  assignee: string | null
  status: TaskStatus
  dueDate: string | null  // YYYY-MM-DD
  order: number           // drag-and-drop position
  createdAt: string       // ISO 8601
}

export interface Assignee {
  id: number
  name: string
}

// DTOs
export type CreateProjectDto = Pick<Project, 'name' | 'description'>
export type UpdateProjectDto = Partial<Omit<Project, 'id' | 'createdAt'>>

export type CreateTaskDto = Omit<Task, 'id' | 'order' | 'createdAt'>
export type UpdateTaskDto = Partial<Omit<Task, 'id' | 'projectId' | 'createdAt'>>

// UI state
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  key: string
  direction: SortDirection
}

export interface ProjectsFilterState {
  name: string
  status: ProjectStatus | ''
}

export interface TasksFilterState {
  assignee: string
  status: TaskStatus | ''
}

// Constants
export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'active',    label: 'Active'    },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold',   label: 'On Hold'   },
]

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'todo',        label: 'To Do'       },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done',        label: 'Done'        },
]

export const ASSIGNEES: Assignee[] = [
  { id: 1, name: 'Alice Johnson'  },
  { id: 2, name: 'Bob Smith'      },
  { id: 3, name: 'Carol Williams' },
  { id: 4, name: 'David Brown'    },
  { id: 5, name: 'Eva Martinez'   },
]
