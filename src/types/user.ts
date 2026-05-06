export interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  usuario: string
  role: string | null
  roleId: string | null
  permissions: string[]
  activo: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface UserCreate {
  nombre: string
  apellido: string
  email: string
  usuario: string
  password: string
  role?: string | null
  roleId?: string | null
  permissions?: string[]
  activo?: boolean
}

export interface UserUpdate {
  nombre?: string
  apellido?: string
  email?: string
  usuario?: string
  password?: string
  role?: string | null
  roleId?: string | null
  permissions?: string[]
  activo?: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}