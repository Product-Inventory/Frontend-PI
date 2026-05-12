'use client';

import { useState, useEffect } from 'react';
import { suppliersService } from '@/services/suppliers.service';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplier?: any;
}

export default function SupplierFormModal({ isOpen, onClose, onSuccess, supplier }: SupplierFormModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    rfc: '',
    email: '',
    telefono: '',
    direccion: '',
    contacto: '',
    giro: '',
    notas: '',
    activo: true,
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        nombre: supplier.nombre,
        rfc: supplier.rfc || '',
        email: supplier.email || '',
        telefono: supplier.telefono || '',
        direccion: supplier.direccion || '',
        contacto: supplier.contacto || '',
        giro: supplier.giro || '',
        notas: supplier.notas || '',
        activo: supplier.activo,
      });
    } else {
      setFormData({
        nombre: '',
        rfc: '',
        email: '',
        telefono: '',
        direccion: '',
        contacto: '',
        giro: '',
        notas: '',
        activo: true,
      });
    }
    setErrors({});
  }, [supplier, isOpen]);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre / Razón social obligatorio';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (supplier) {
        await suppliersService.update(supplier.id, formData);
      } else {
        await suppliersService.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar proveedor');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass-card rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">{supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-1">Nombre / Razón social *</label>
            <input type="text" className="glass-input w-full" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
            {errors.nombre && <p className="text-red-300 text-xs">{errors.nombre}</p>}
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">RFC</label>
            <input type="text" className="glass-input w-full" value={formData.rfc} onChange={(e) => setFormData({ ...formData, rfc: e.target.value })} />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">Contacto</label>
            <input type="text" className="glass-input w-full" value={formData.contacto} onChange={(e) => setFormData({ ...formData, contacto: e.target.value })} />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">Email</label>
            <input type="email" className="glass-input w-full" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            {errors.email && <p className="text-red-300 text-xs">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">Teléfono</label>
            <input type="tel" className="glass-input w-full" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">Dirección</label>
            <input type="text" className="glass-input w-full" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">Giro</label>
            <input type="text" className="glass-input w-full" value={formData.giro} onChange={(e) => setFormData({ ...formData, giro: e.target.value })} />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">Notas</label>
            <textarea className="glass-input w-full" rows={2} value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">Estado</label>
            <select className="glass-input w-full" value={formData.activo ? 'true' : 'false'} onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full bg-white/10 text-white">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-full bg-white/20 text-white font-semibold">
              {loading ? 'Guardando...' : supplier ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}