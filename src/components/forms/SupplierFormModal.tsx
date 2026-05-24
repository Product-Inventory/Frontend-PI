'use client';

import { useState, useEffect } from 'react';
import { Portal } from '@/components/ui/Portal';
import { suppliersService } from '@/services/suppliers.service';
import { Supplier } from '@/types/supplier';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplier?: Supplier | null;  
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
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Company name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'select-one' && name === 'activo') {
      setFormData(prev => ({ ...prev, activo: value === 'true' }));
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
      if (supplier) {
        await suppliersService.update(supplier.id, formData);
      } else {
        await suppliersService.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
    <div className="app-modal-overlay app-modal-overlay--padded app-modal-overlay--form">
      <div className="app-modal-shell app-modal-shell--md glass-card rounded-2xl overflow-y-auto max-h-full scrollbar-none p-6 shadow-2xl">

        <h2 className="text-xl font-bold text-white mb-4">
          {supplier ? 'Edit Supplier' : 'New Supplier'}
        </h2>

        <h2 className="text-xl font-bold text-white mb-4">{supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-1">Company name *</label>
              <input type="text" name="nombre" className="glass-input w-full" value={formData.nombre} onChange={handleChange} />
              {errors.nombre && <p className="text-red-300 text-xs">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-1">RFC</label>
              <input type="text" name="rfc" className="glass-input w-full" value={formData.rfc} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-1">Contact person</label>
              <input type="text" name="contacto" className="glass-input w-full" value={formData.contacto} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-1">Email</label>
              <input type="email" name="email" className="glass-input w-full" value={formData.email} onChange={handleChange} />
              {errors.email && <p className="text-red-300 text-xs">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-1">Phone</label>
              <input type="tel" name="telefono" className="glass-input w-full" value={formData.telefono} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-1">Address</label>
              <input type="text" name="direccion" className="glass-input w-full" value={formData.direccion} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-1">Business line</label>
              <input type="text" name="giro" className="glass-input w-full" value={formData.giro} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-1">Status</label>
              <select name="activo" className="glass-input w-full" value={formData.activo ? 'true' : 'false'} onChange={handleChange}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-1">Notes</label>
            <textarea name="notas" className="glass-input w-full" rows={2} value={formData.notas} onChange={handleChange} />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20">Cancel</button>
            <button type="submit" disabled={loading} className="products-violet-black-button px-4 py-2 rounded-full text-white font-semibold">
              {loading ? 'Saving...' : supplier ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}