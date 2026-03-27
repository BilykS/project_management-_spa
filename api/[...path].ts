import { readFileSync } from 'fs'
import { join } from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

interface Project {
  id: number
  name: string
  description: string
  status: string
  taskCount: number
  createdAt: string
  [key: string]: unknown
}

interface Task {
  id: number
  projectId: number
  title: string
  assignee: string | null
  status: string
  dueDate: string | null
  order: number
  createdAt: string
  [key: string]: unknown
}

interface DB {
  projects: Project[]
  tasks: Task[]
}

// Module-level singleton — shared across requests within a warm instance
let db: DB | null = null

function getDB(): DB {
  if (!db) {
    const raw  = readFileSync(join(process.cwd(), 'db.json'), 'utf-8')
    const data = JSON.parse(raw)
    db = {
      projects: data.projects ?? [],
      tasks: (data.tasks ?? []).filter((t: Task) => t.projectId && t.title),
    }
  }
  return db
}

function nextId(items: { id: number }[]): number {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1
}

function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', chunk => { raw += String(chunk) })
    req.on('end', () => {
      try { resolve(JSON.parse(raw)) } catch { resolve({}) }
    })
  })
}

function send(res: ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url      = new URL(req.url ?? '/', 'http://localhost')
  const parts    = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean)
  const resource = parts[0]           // 'projects' | 'tasks'
  const id       = parts[1] ? parseInt(parts[1], 10) : null

  const store = getDB()
  const body  = req.method !== 'GET' && req.method !== 'DELETE'
    ? await readBody(req)
    : {}

  // /api/projects
  if (resource === 'projects') {
    if (id === null) {
      if (req.method === 'GET') {
        const nameLike = url.searchParams.get('name_like')
        const status   = url.searchParams.get('status')
        let result = store.projects
        if (nameLike) result = result.filter(p => new RegExp(nameLike, 'i').test(p.name))
        if (status)   result = result.filter(p => p.status === status)
        return send(res, result)
      }
      if (req.method === 'POST') {
        const item = { ...body, id: nextId(store.projects) } as Project
        store.projects.push(item)
        return send(res, item, 201)
      }
    } else {
      const idx = store.projects.findIndex(p => p.id === id)
      if (idx === -1) return send(res, { message: 'Not found' }, 404)
      if (req.method === 'GET')    return send(res, store.projects[idx])
      if (req.method === 'PUT')  { store.projects[idx] = { ...body, id } as Project;                          return send(res, store.projects[idx]) }
      if (req.method === 'PATCH'){ store.projects[idx] = { ...store.projects[idx], ...body };                 return send(res, store.projects[idx]) }
      if (req.method === 'DELETE'){ store.projects.splice(idx, 1);                                            return send(res, {}) }
    }
  }

  // /api/tasks
  if (resource === 'tasks') {
    if (id === null) {
      if (req.method === 'GET') {
        const pid          = url.searchParams.get('projectId')
        const assigneeLike = url.searchParams.get('assignee_like')
        const status       = url.searchParams.get('status')
        let result = pid
          ? store.tasks.filter(t => t.projectId === parseInt(pid, 10))
          : store.tasks
        if (assigneeLike) result = result.filter(t => t.assignee && new RegExp(assigneeLike, 'i').test(t.assignee))
        if (status)       result = result.filter(t => t.status === status)
        return send(res, result)
      }
      if (req.method === 'POST') {
        const item = { ...body, id: nextId(store.tasks) } as Task
        store.tasks.push(item)
        return send(res, item, 201)
      }
    } else {
      const idx = store.tasks.findIndex(t => t.id === id)
      if (idx === -1) return send(res, { message: 'Not found' }, 404)
      if (req.method === 'GET')    return send(res, store.tasks[idx])
      if (req.method === 'PUT')  { store.tasks[idx] = { ...body, id } as Task;                               return send(res, store.tasks[idx]) }
      if (req.method === 'PATCH'){ store.tasks[idx] = { ...store.tasks[idx], ...body };                      return send(res, store.tasks[idx]) }
      if (req.method === 'DELETE'){ store.tasks.splice(idx, 1);                                               return send(res, {}) }
    }
  }

  send(res, { message: 'Not found' }, 404)
}
