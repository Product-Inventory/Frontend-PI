'use client';

import { useState, useEffect } from 'react';
import { usersService } from '@/services/users.service';
import { rolesService } from '@/services/roles.service';
import { User } from '@/types/user';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
}

export default function UserFormModal({ isOpen, onClose, onSuccess, user }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    usuario: '',
    password: '',
    roleId: '',
    role: '',
    activo: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: string; nombre: string }[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // Cargar roles disponibles desde el backend
  useEffect(() => {
    if (!isOpen) return;
    rolesService.getAll()
      .then(data => {
        setRoles(data.items);
        if (data.items.length > 0 && !formData.roleId && !user) {
          // Si hay roles y estamos en modo creación, seleccionar el primero por defecto
          setFormData(prev => ({
            ...prev,
            roleId: data.items[0].id,
            role: data.items[0].nombre,
          }));
        }
      })
      .catch(err => console.error('Error loading roles:', err))
      .finally(() => setRolesLoading(false));
  }, [isOpen]);

  // Cargar datos del usuario si es edición
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        usuario: user.usuario,
        password: '',
        roleId: user.roleId || '',
        role: user.role || '',
        activo: user.activo,
      });
    } else {
      // No resetear roleId/role si ya se cargaron roles y no hay usuario
      setFormData(prev => ({
        ...prev,
        nombre: '',
        apellido: '',
        email: '',
        usuario: '',
        password: '',
        activo: true,
      }));
    }
    setErrors({});
  }, [user, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre obligatorio';
    if (!formData.apellido.trim()) newErrors.apellido = 'Apellido obligatorio';
    if (!formData.email.trim()) newErrors.email = 'Email obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email inválido';
    if (!formData.usuario.trim()) newErrors.usuario = 'Usuario obligatorio';
    if (!user && !formData.password) newErrors.password = 'Contraseña obligatoria';
    else if (!user && formData.password && formData.password.length < 4)
      newErrors.password = 'Mínimo 4 caracteres';
    if (!formData.roleId) newErrors.roleId = 'Rol obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'roleId') {
      const selectedRole = roles.find(r => r.id === value);
      setFormData(prev => ({
        ...prev,
        roleId: value,
        role: selectedRole?.nombre || '',
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (user) {
        const updateData: any = { ...formData };
        if (!updateData.password) delete updateData.password;
        await usersService.update(user.id, updateData);
      } else {
        await usersService.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="app-modal-overlay app-modal-overlay--padded">
      <div className="app-modal-shell app-modal-shell--md glass-card rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">
          {user ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Nombre *</label>
            <input
              type="text"
              name="nombre"
              className="glass-input w-full"
              value={formData.nombre}
              onChange={handleChange}
            />
            {errors.nombre && <p className="text-red-300 text-xs mt-1">{errors.nombre}</p>}
          </div>
          {/* Apellido */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Apellido *</label>
            <input
              type="text"
              name="apellido"
              className="glass-input w-full"
              value={formData.apellido}
              onChange={handleChange}
            />
            {errors.apellido && <p className="text-red-300 text-xs mt-1">{errors.apellido}</p>}
          </div>
          {/* Email */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Email *</label>
            <input
              type="email"
              name="email"
              className="glass-input w-full"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
          </div>
          {/* Usuario */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Usuario *</label>
            <input
              type="text"
              name="usuario"
              className="glass-input w-full"
              value={formData.usuario}
              onChange={handleChange}
            />
            {errors.usuario && <p className="text-red-300 text-xs mt-1">{errors.usuario}</p>}
          </div>
          {/* Contraseña */}
          <div>
            <label className="block text-white/80 text-sm mb-1">
              {user ? 'Contraseña (dejar vacía para no cambiar)' : 'Contraseña *'}
            </label>
            <input
              type="password"
              name="password"
              className="glass-input w-full"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password}</p>}
          </div>
          {/* Rol (select dinámico) */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Rol *</label>
            {rolesLoading ? (
              <div className="glass-input w-full text-white/50">Cargando roles...</div>
            ) : (
              <select
                name="roleId"
                className="glass-input w-full"
                value={formData.roleId}
                onChange={handleChange}
              >
                <option value="">Seleccione un rol</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.nombre}
                  </option>
                ))}
              </select>
            )}
            {errors.roleId && <p className="text-red-300 text-xs mt-1">{errors.roleId}</p>}
          </div>
          {/* Activo */}
          <label className="flex items-center gap-2 text-white/80">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
            />
            Activo
          </label>
          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || rolesLoading}
              className="px-4 py-2 rounded-full bg-white/20 text-white font-semibold hover:bg-white/30 transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}