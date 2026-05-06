import { api } from './api'
import { User, UserCreate, UserUpdate, PaginatedResponse } from '@/types/user'

export const usersService = {
  getAll: (params?: { q?: string; activo?: boolean; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<User>>('/users', { params }),

  getById: (id: string) =>
    api.get<{ item: User }>(`/users/${id}`),

  create: (data: UserCreate) =>
    api.post<{ message: string; item: User }>('/users', data),

  update: (id: string, data: UserUpdate) =>
    api.patch<{ message: string; item: User }>(`/users/${id}`, data),

  toggleActive: (id: string, activo: boolean) =>
    api.patch<{ message: string; item: User }>(`/users/${id}/toggle-active`, { activo }),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/users/${id}`)
}