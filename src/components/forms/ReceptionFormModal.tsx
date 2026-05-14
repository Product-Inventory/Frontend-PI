'use client';

import { useState, useEffect } from 'react';
import { receptionsService } from '@/services/receptions.service';
import { suppliersService } from '@/services/suppliers.service';
import { productsService } from '@/services/products.service';
import { Reception, ReceptionFormValues, ReceptionItem } from '@/types/reception';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reception?: Reception | null;
}

export default function ReceptionFormModal({ isOpen, onClose, onSuccess, reception }: Props) {
  const [form, setForm] = useState<ReceptionFormValues>({
    supplierId: '',
    fecha: new Date().toISOString().slice(0, 10),
    folio: '',
    comentarios: '',
    items: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: string; nombre: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; nombre: string; sku?: string; precioCompra: number }[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      suppliersService.getAll().then(data => setSuppliers(data.items)),
      productsService.getAll().then(data => setProducts(data.items)),
    ]).finally(() => {
      setLoadingSuppliers(false);
      setLoadingProducts(false);
    });
  }, [isOpen]);

  useEffect(() => {
    if (reception) {
      setForm({
        supplierId: reception.supplierId,
        fecha: reception.fecha.slice(0, 10),
        folio: reception.folio,
        comentarios: reception.comentarios || '',
        items: reception.items,
      });
    } else {
      setForm({
        supplierId: '',
        fecha: new Date().toISOString().slice(0, 10),
        folio: '',
        comentarios: '',
        items: [],
      });
    }
    setErrors({});
  }, [reception, isOpen]);

  const addItem = () => {
    const newItem: ReceptionItem = {
      productId: '',
      sku: '',
      productNombre: '',
      cantidad: 1,
      costoUnitario: 0,
      subtotal: 0,
    };
    setForm(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

    const updateItem = (index: number, field: keyof ReceptionItem, value: any) => {
  setForm(prev => ({
    ...prev,
    items: prev.items.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      
      if (field === 'productId') {
        const selectedProduct = products.find(p => p.id === value);
        if (selectedProduct) {
          updated.costoUnitario = selectedProduct.precioCompra;
          updated.productNombre = selectedProduct.nombre;
          updated.sku = selectedProduct.sku || '';
        } else {
          updated.costoUnitario = 0;
        }
      }
      
      // Validar cantidad: mínimo 1
      if (field === 'cantidad') {
        let qty = parseFloat(value);
        if (isNaN(qty) || qty < 1) qty = 1;
        updated.cantidad = qty;
      }
      
      if (field === 'cantidad' || field === 'costoUnitario' || field === 'productId') {
        updated.subtotal = updated.cantidad * updated.costoUnitario;
      }
      
      return updated;
    }),
  }));
};
  

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!form.supplierId) err.supplierId = 'Select a supplier';
    if (!form.fecha) err.fecha = 'Date is required';
    if (!form.folio.trim()) err.folio = 'Folio is required';
    if (form.items.length === 0) err.items = 'Add at least one product';
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      if (!item.productId) err[`product_${i}`] = 'Select a product';
      if (item.cantidad <= 0) err[`cantidad_${i}`] = 'Quantity > 0';
      if (item.costoUnitario <= 0) err[`costo_${i}`] = 'Unit cost > 0';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (reception) {
        await receptionsService.update(reception.id, form);
      } else {
        await receptionsService.create(form);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving reception');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="glass-card rounded-2xl w-full max-w-4xl p-6 my-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">
          {reception ? 'Edit Reception' : 'New Reception'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Supplier */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Supplier *</label>
            {loadingSuppliers ? (
              <div className="glass-input w-full text-white/50">Loading...</div>
            ) : (
              <select
                className="glass-input w-full"
                value={form.supplierId}
                onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
              >
                <option value="">Select</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            )}
            {errors.supplierId && <p className="text-red-300 text-xs mt-1">{errors.supplierId}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Date *</label>
            <input
              type="date"
              className="glass-input w-full"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />
            {errors.fecha && <p className="text-red-300 text-xs mt-1">{errors.fecha}</p>}
          </div>

          {/* Folio */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Folio *</label>
            <input
              type="text"
              className="glass-input w-full"
              value={form.folio}
              onChange={(e) => setForm({ ...form, folio: e.target.value })}
            />
            {errors.folio && <p className="text-red-300 text-xs mt-1">{errors.folio}</p>}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Comments</label>
            <textarea
              className="glass-input w-full"
              rows={2}
              value={form.comentarios || ''}
              onChange={(e) => setForm({ ...form, comentarios: e.target.value })}
            />
          </div>

          {/* Items */}
            <div>
            <label className="block text-white/80 text-sm mb-1">Products *</label>
            {form.items.map((item, idx) => (
                <div key={idx} className="flex flex-wrap gap-2 mb-3 items-center">
                <select
                    className="glass-input flex-1 min-w-[180px]"
                    value={item.productId}
                    onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                >
                    <option value="">Select product</option>
                    {products.map(p => (
                    <option key={p.id} value={p.id}>
                        {p.nombre} {p.sku ? `(${p.sku})` : ''} - ${p.precioCompra?.toFixed(2) || '0'}
                    </option>
                    ))}
                </select>
                <input
                    type="number"
                    placeholder="Qty"
                    className="glass-input w-24"
                    value={item.cantidad}
                    onChange={(e) => updateItem(idx, 'cantidad', parseFloat(e.target.value) || 0)}
                />
                {/* Costo unitario */}
                   <div className="flex flex-col gap-1">
      {/* Unit Cost box */}
      <div className="text-white/80 text-sm bg-white/5 px-2 py-1 rounded w-28 flex flex-col items-center">
        <span>Unit Cost</span>
        <span>${item.costoUnitario.toFixed(2)}</span>
      </div>
      {/* Subtotal box */}
      <div className="text-white/80 text-sm bg-white/5 px-2 py-1 rounded w-28 flex flex-col items-center">
        <span>Subtotal</span>
        <span>${item.subtotal.toFixed(2)}</span>
      </div>
    </div>
                <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300">🗑️</button>
                </div>
            ))}
            <button type="button" onClick={addItem} className="text-blue-300 text-sm hover:underline">+ Add product</button>
            {errors.items && <p className="text-red-300 text-xs mt-1">{errors.items}</p>}
            </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-full bg-white/20 text-white font-semibold hover:bg-white/30 disabled:opacity-50">
              {loading ? 'Saving...' : reception ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}