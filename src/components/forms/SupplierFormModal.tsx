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
  setToast: (toast: { message: string; type: "success" | "error" } | null) => void;
}

// RFC persona física: 4 letras + 6 dígitos de fecha + 3 caracteres de homoclave = 13 caracteres
const RFC_REGEX = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

export default function SupplierFormModal({
  isOpen,
  onClose,
  onSuccess,
  supplier,
  setToast,
}: SupplierFormModalProps) {
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
    setTouched({});
  }, [supplier, isOpen]);

  // ── Validación de un campo individual ──────────────────────────────────────
  const validateField = (name: string, value: string): string | undefined => {
    const v = value.trim();

    switch (name) {
      case 'nombre':
        if (!v) return 'Company name is required';
        if (v.length < 2) return 'Company name must be at least 2 characters';
        return;

      case 'rfc':
        if (!v) return 'RFC is required';
        if (!RFC_REGEX.test(v))
          return 'RFC must be 13 characters: 4 letters, 6 digits (date) and 3 alphanumeric (homoclave)';
        return;

      case 'email':
        if (!v) return 'Email is required';
        if (!EMAIL_REGEX.test(v)) return 'Enter a valid email address';
        return;

      case 'telefono':
        if (!v) return 'Phone number is required';
        if (!PHONE_REGEX.test(v)) return 'Phone number must be exactly 10 digits';
        return;

      case 'giro':
        if (!v) return 'Business line is required';
        if (v.length < 2) return 'Business line must be at least 2 characters';
        return;

      // contacto, direccion, notas son opcionales
      default:
        return;
    }
  };

  // ── Validación completa del formulario ──────────────────────────────────────
  const validateForm = (): Record<string, string> => {
    const requiredFields = ['nombre', 'rfc', 'email', 'telefono', 'giro'] as const;
    const newErrors: Record<string, string> = {};

    for (const field of requiredFields) {
      const error = validateField(field, formData[field] ?? '');
      if (error) newErrors[field] = error;
    }

    return newErrors;
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === 'select-one' && name === 'activo' ? value === 'true' : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      const error = validateField(name, String(newValue));
      setErrors((prev) => ({ ...prev, [name]: error ?? '' }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error ?? '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos requeridos como tocados
    const allFields = ['nombre', 'rfc', 'email', 'telefono', 'giro', 'contacto', 'direccion', 'notas', 'activo'];
    setTouched(allFields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setToast({ message: 'All fields are required', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (supplier) {
        await suppliersService.update(supplier.id, formData);
        setToast({ message: 'Supplier updated successfully', type: 'success' });
      } else {
        await suppliersService.create(formData);
        setToast({ message: 'Supplier created successfully', type: 'success' });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Error saving supplier', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const buttonBase =
    'inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-5 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50';

  return (
    <Portal>
      <div className="app-modal-overlay app-modal-overlay--form px-4 py-4">
        <div className="app-modal-shell app-modal-shell--lg glass-card relative overflow-y-auto max-h-[90vh] scrollbar-none p-6 md:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {supplier ? 'Edit Supplier' : 'New Supplier'}
          </h2>
          <p className="mt-1 mb-5 text-sm text-slate-600">
            {supplier ? 'Modify supplier details.' : 'Register a new supplier.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="nombre"
                  className="glass-input w-full"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Distribuidora López S.A."
                />
                {errors.nombre && (
                  <p className="text-rose-600 text-xs mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* RFC */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  RFC *
                </label>
                <input
                  type="text"
                  name="rfc"
                  className="glass-input w-full uppercase"
                  value={formData.rfc}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="LOPL850312AB3"
                  maxLength={13}
                />
                {errors.rfc && (
                  <p className="text-rose-600 text-xs mt-1">{errors.rfc}</p>
                )}
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contacto"
                  className="glass-input w-full"
                  value={formData.contacto}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Juan López"
                />
                {errors.contacto && (
                  <p className="text-rose-600 text-xs mt-1">{errors.contacto}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  className="glass-input w-full"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="contacto@empresa.com"
                />
                {errors.email && (
                  <p className="text-rose-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="telefono"
                  className="glass-input w-full"
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="5512345678"
                  maxLength={10}
                />
                {errors.telefono && (
                  <p className="text-rose-600 text-xs mt-1">{errors.telefono}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="direccion"
                  className="glass-input w-full"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Av. Insurgentes 123, CDMX"
                />
                {errors.direccion && (
                  <p className="text-rose-600 text-xs mt-1">{errors.direccion}</p>
                )}
              </div>

              {/* Business Line */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Business Line *
                </label>
                <input
                  type="text"
                  name="giro"
                  className="glass-input w-full"
                  value={formData.giro}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Electrónica y cómputo"
                />
                {errors.giro && (
                  <p className="text-rose-600 text-xs mt-1">{errors.giro}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Status
                </label>
                <select
                  name="activo"
                  className="glass-input w-full"
                  value={formData.activo ? 'true' : 'false'}
                  onChange={handleChange}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Notes
              </label>
              <textarea
                name="notas"
                className="glass-input w-full"
                rows={2}
                value={formData.notas}
                onChange={handleChange}
                placeholder="Optional additional information..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className={buttonBase}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
              >
                {loading ? 'Saving...' : supplier ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
