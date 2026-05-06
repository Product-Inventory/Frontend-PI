'use client'

import { useEffect, useState } from 'react'
import { usersService } from '@/services/users.service'
import { User } from '@/types/user'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await usersService.getAll()
      setUsers(res.data.items)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await usersService.toggleActive(id, !currentActive)
      await loadUsers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cambiar estado')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar usuario?')) return
    try {
      await usersService.delete(id)
      await loadUsers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar')
    }
  }

  if (loading) return <div className="p-6 text-white">Cargando usuarios...</div>
  if (error) return <div className="p-6 text-red-200">Error: {error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white drop-shadow-md">Usuarios</h1>
        <button className="bg-white/20 backdrop-blur-sm border border-white/40 rounded-full px-4 py-2 text-white font-semibold shadow-md hover:bg-white/30 transition">
          + Nuevo Usuario
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-white/90">
            <thead className="bg-white/10 backdrop-blur-sm">
              <tr>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Usuario</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Rol</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-white/20 hover:bg-white/5 transition">
                  <td className="p-3">{user.nombre} {user.apellido}</td>
                  <td className="p-3">{user.usuario}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role || 'Sin rol'}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.activo ? 'bg-green-400/30 text-green-100' : 'bg-red-400/30 text-red-100'}`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(user.id, user.activo)}
                      className="text-yellow-200 hover:text-yellow-100 transition"
                    >
                      {user.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button className="text-blue-200 hover:text-blue-100 transition">Editar</button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-200 hover:text-red-100 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-white/60">No hay usuarios registrados</div>
      )}
    </div>
  )
}