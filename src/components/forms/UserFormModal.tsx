'use client';

import { useState, useEffect } from 'react';
import { Portal } from '@/components/ui/Portal';
import { usersService } from '@/services/users.service';
import { rolesService } from '@/services/roles.service';
import { User } from '@/types/user';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
  setToast: (toast: { message: string; type: "success" | "error" } | null) => void;
}

export default function UserFormModal({ isOpen, onClose, onSuccess, user, setToast }: UserFormModalProps) {
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

  useEffect(() => {
    if (!isOpen) return;
    rolesService.getAll()
      .then(data => {
        setRoles(data.items);
        if (data.items.length > 0 && !formData.roleId && !user) {
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
    if (!formData.nombre.trim()) newErrors.nombre = 'First name is required';
    if (!formData.apellido.trim()) newErrors.apellido = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email';
    if (!formData.usuario.trim()) newErrors.usuario = 'Username is required';
    if (!user && !formData.password) newErrors.password = 'Password is required';
    else if (!user && formData.password && formData.password.length < 4)
      newErrors.password = 'Minimum 4 characters';
    if (!formData.roleId) newErrors.roleId = 'Role is required';
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
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
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
        setToast({ message: "User updated successfully", type: "success" });
      } else {
        await usersService.create(formData);
        setToast({ message: "User created successfully", type: "success" });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || "Error saving user", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const buttonBase = "inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";

  return (
    <Portal>
    <div className="app-modal-overlay app-modal-overlay--padded app-modal-overlay--form">
      <div className="app-modal-shell app-modal-shell--lg glass-card rounded-[28px] overflow-y-auto max-h-full scrollbar-none p-6 md:p-8">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {user ? 'Edit User' : 'New User'}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {user ? 'Modify user details.' : 'Register a new system user.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">First name *</label>
              <input
                type="text"
                name="nombre"
                className="glass-input w-full"
                value={formData.nombre}
                onChange={handleChange}
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Last name *</label>
              <input
                type="text"
                name="apellido"
                className="glass-input w-full"
                value={formData.apellido}
                onChange={handleChange}
              />
              {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                className="glass-input w-full"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Username *</label>
              <input
                type="text"
                name="usuario"
                className="glass-input w-full"
                value={formData.usuario}
                onChange={handleChange}
              />
              {errors.usuario && <p className="text-red-500 text-xs mt-1">{errors.usuario}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                {user ? 'Password (leave blank to keep)' : 'Password *'}
              </label>
              <input
                type="password"
                name="password"
                className="glass-input w-full"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Role *</label>
              {rolesLoading ? (
                <div className="glass-input w-full text-slate-400">Loading roles...</div>
              ) : (
                <select
                  name="roleId"
                  className="glass-input w-full"
                  value={formData.roleId}
                  onChange={handleChange}
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.nombre}</option>
                  ))}
                </select>
              )}
              {errors.roleId && <p className="text-red-500 text-xs mt-1">{errors.roleId}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="rounded border-white/60 text-indigo-600 focus:ring-indigo-500"
                />
                Active user
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className={buttonBase}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? 'Saving...' : user ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}