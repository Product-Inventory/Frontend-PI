'use client';

import { useState, useEffect } from 'react';
import { usersService } from '@/services/users.service';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any;
}

export default function UserFormModal({ isOpen, onClose, onSuccess, user }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    usuario: '',
    password: '',
    roleId: 'role_admin',
    activo: true,
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        usuario: user.usuario,
        password: '',
        roleId: user.roleId || 'role_admin',
        activo: user.activo,
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        usuario: '',
        password: '',
        roleId: 'role_admin',
        activo: true,
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre obligatorio';
    if (!formData.apellido.trim()) newErrors.apellido = 'Apellido obligatorio';
    if (!formData.email.trim()) newErrors.email = 'Email obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.usuario.trim()) newErrors.usuario = 'Usuario obligatorio';
    if (!user && !formData.password) newErrors.password = 'Contraseña obligatoria';
    if (!formData.roleId) newErrors.roleId = 'Rol obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (user) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await usersService.update(user.id, updateData);
      } else {
        await usersService.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass-card rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">{user ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-1">Nombre *</label>
            <input type="text" className="glass-input w-full" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
            {errors.nombre && <p className="text-red-300 text-xs">{errors.nombre}</p>}
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">Apellido *</label>
            <input type="text" className="glass-input w-full" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} />
            {errors.apellido && <p className="text-red-300 text-xs">{errors.apellido}</p>}
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">Email *</label>
            <input type="email" className="glass-input w-full" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            {errors.email && <p className="text-red-300 text-xs">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">Usuario *</label>
            <input type="text" className="glass-input w-full" value={formData.usuario} onChange={(e) => setFormData({ ...formData, usuario: e.target.value })} />
            {errors.usuario && <p className="text-red-300 text-xs">{errors.usuario}</p>}
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">{user ? 'Contraseña (dejar vacía para no cambiar)' : 'Contraseña *'}</label>
            <input type="password" className="glass-input w-full" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            {errors.password && <p className="text-red-300 text-xs">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">Rol *</label>
            <select className="glass-input w-full" value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}>
              <option value="role_admin">Administrador</option>
              <option value="role_user">Usuario</option>
            </select>
            {errors.roleId && <p className="text-red-300 text-xs">{errors.roleId}</p>}
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full bg-white/10 text-white">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-full bg-white/20 text-white font-semibold">
              {loading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}