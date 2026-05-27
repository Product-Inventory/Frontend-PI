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

export default function SupplierFormModal({ isOpen, onClose, onSuccess, supplier, setToast }: SupplierFormModalProps) {
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
  }, [supplier, isOpen]);

  const validateForm = (): Record<string, string> => {
  const newErrors: Record<string, string> = {};

  if (!formData.nombre.trim()) newErrors.nombre = "Company name is required";
  else if (formData.nombre.trim().length < 2) newErrors.nombre = "Company name must be at least 2 characters";

  if (!formData.email.trim()) newErrors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";

  if (!formData.telefono.trim()) newErrors.telefono = "Phone number is required";
  else if (!/^\d{10}$/.test(formData.telefono)) newErrors.telefono = "Phone must have exactly 10 digits";

  return newErrors;
};

  const validateField = (name: string, value: any): string | undefined => {
  const v = String(value ?? "").trim();

  switch (name) {
    case "nombre":
      if (!v) return "Company name is required";
      if (v.length < 2) return "Company name must be at least 2 characters";
      return;

    case "email":
      if (!v) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email";
      return;

    case "telefono":
      if (!v) return "Phone number is required";
      if (!/^\d{10}$/.test(v)) return "Phone must have exactly 10 digits";
      return;

    // Los demás campos son opcionales (rfc, contacto, direccion, giro, notas)
    default:
      return;
  }
};
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setTouched((prev) => ({ ...prev, [name]: true }));
  const error = validateField(name, value);
  setErrors((prev) => ({ ...prev, [name]: error }));
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value, type } = e.target;
  const newValue = type === "select-one" && name === "activo" ? value === "true" : value;

  setFormData((prev) => ({ ...prev, [name]: newValue }));

  // Limpiar error del campo si existe
  if (errors[name]) {
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  // Si ya estaba tocado, validar en tiempo real
  if (touched[name]) {
    const error = validateField(name, newValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }
};

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Marcar todos los campos como tocados para mostrar errores
  const allFields = ["nombre", "email", "telefono", "rfc", "contacto", "direccion", "giro", "notas", "activo"];
  const newTouched = allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
  setTouched(newTouched);

  const newErrors = validateForm();
  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    setToast({ message: "Please fix the errors before saving", type: "error" });
    return;
  }

  setLoading(true);
  try {
    if (supplier) {
      await suppliersService.update(supplier.id, formData);
      setToast({ message: "Supplier updated successfully", type: "success" });
    } else {
      await suppliersService.create(formData);
      setToast({ message: "Supplier created successfully", type: "success" });
    }
    onSuccess();
    onClose();
  } catch (err: any) {
    setToast({ message: err.response?.data?.message || "Error saving supplier", type: "error" });
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="app-modal-overlay app-modal-overlay--form px-4 py-4">
        <div className="app-modal-shell app-modal-shell--lg glass-card relative overflow-y-auto max-h-[90vh] scrollbar-none p-6 md:p-8">
    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
  {supplier ? 'Edit Supplier' : 'New Supplier'}
</h2>
<p className="mt-1 text-sm text-slate-600">
  {supplier ? 'Modify supplier details.' : 'Register a new supplier.'}
</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
             <label className="block text-sm font-semibold text-slate-800 mb-1">Company Name</label>
              <input type="text" name="nombre" className="glass-input w-full" value={formData.nombre} onChange={handleChange} onBlur={handleBlur}/>
              {errors.nombre && <p className="text-rose-600 text-xs">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">RFC</label>
              <input type="text" name="rfc" className="glass-input w-full" value={formData.rfc} onChange={handleChange} onBlur={handleBlur}/>
               {errors.nombre && <p className="text-rose-600 text-xs">{errors.nombre}</p>}
            </div>
            <div>
             <label className="block text-sm font-semibold text-slate-800 mb-1">Contact Person</label>
              <input type="text" name="contacto" className="glass-input w-full" value={formData.contacto} onChange={handleChange}onBlur={handleBlur}/>
               {errors.nombre && <p className="text-rose-600 text-xs">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Email</label>
              <input type="email" name="email" className="glass-input w-full" value={formData.email} onChange={handleChange}onBlur={handleBlur}/>
              {errors.email && <p className="text-rose-600 text-xs">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Phone Number</label>
              <input type="tel" name="telefono" className="glass-input w-full" value={formData.telefono} onChange={handleChange}onBlur={handleBlur}/>
               {errors.nombre && <p className="text-rose-600 text-xs">{errors.nombre}</p>}
            </div>
            <div>
             <label className="block text-sm font-semibold text-slate-800 mb-1">Adress</label>
              <input type="text" name="direccion" className="glass-input w-full" value={formData.direccion} onChange={handleChange}onBlur={handleBlur}/>
               {errors.nombre && <p className="text-rose-600 text-xs">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Business Line</label>
              <input type="text" name="giro" className="glass-input w-full" value={formData.giro} onChange={handleChange}onBlur={handleBlur}/>
               {errors.nombre && <p className="text-rose-600 text-xs">{errors.nombre}</p>}
            </div>
            <div>
           <label className="block text-sm font-semibold text-slate-800 mb-1">Status</label>
              <select name="activo" className="glass-input w-full" value={formData.activo ? 'true' : 'false'} onChange={handleChange}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div>
           <label className="block text-sm font-semibold text-slate-800 mb-1">Notes</label>
            <textarea name="notas" className="glass-input w-full" rows={2} value={formData.notas} onChange={handleChange} />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-5 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50">
                Cancel 
              </button>
            <button type="submit" disabled={loading} className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60">
                {loading ? 'Saving...' : supplier ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}