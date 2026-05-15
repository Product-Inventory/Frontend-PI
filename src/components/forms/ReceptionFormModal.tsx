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
  recepcion?: Reception | null;
}

export default function RecepcionFormModal({ isOpen, onClose, onSuccess, recepcion }: Props) {
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
  const [products, setProducts] = useState<{ id: string; nombre: string; sku?: string; precioCompra?: number }[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Cargar proveedores y productos (incluyendo precioCompra)
  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      suppliersService.getAll().then(data => setSuppliers(data.items)),
      productsService.getAll().then(data => {
        const items = data.items.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          sku: p.sku,
          precioCompra: p.precioCompra ?? 0,
        }));
        setProducts(items);
      }),
    ]).finally(() => {
      setLoadingSuppliers(false);
      setLoadingProducts(false);
    });
  }, [isOpen]);

  useEffect(() => {
    if (recepcion) {
      setForm({
        supplierId: recepcion.supplierId,
        fecha: recepcion.fecha.slice(0, 10),
        folio: recepcion.folio,
        comentarios: recepcion.comentarios || '',
        items: recepcion.items,
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
  }, [recepcion, isOpen]);

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

  // Función tipada correctamente con genérico
  const updateItem = <K extends keyof ReceptionItem>(
    index: number,
    field: K,
    value: ReceptionItem[K]
  ) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };

        // Si cambia el producto, cargar datos del producto
        if (field === 'productId') {
          const selectedProduct = products.find(p => p.id === value);
          if (selectedProduct) {
            updated.costoUnitario = selectedProduct.precioCompra ?? 0;
            updated.productNombre = selectedProduct.nombre;
            updated.sku = selectedProduct.sku || '';
          } else {
            updated.costoUnitario = 0;
          }
        }

        // Validar cantidad: mínimo 1
        if (field === 'cantidad') {
          let qty = typeof value === 'number' ? value : parseFloat(value as any);
          if (isNaN(qty) || qty < 1) qty = 1;
          updated.cantidad = qty;
        }

        // Recalcular subtotal si cambia cantidad, costoUnitario o producto
        if (field === 'cantidad' || field === 'costoUnitario' || field === 'productId') {
          updated.subtotal = Number(updated.cantidad || 0) * Number(updated.costoUnitario || 0);
        }

        return updated;
      }),
    }));
  };

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!form.supplierId) err.supplierId = 'Seleccione un proveedor';
    if (!form.fecha) err.fecha = 'Fecha obligatoria';
    if (!form.folio.trim()) err.folio = 'Folio obligatorio';
    if (form.items.length === 0) err.items = 'Debe agregar al menos un producto';
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      if (!item.productId) err[`product_${i}`] = 'Seleccione producto';
      if (Number(item.cantidad) <= 0) err[`cantidad_${i}`] = 'Cantidad > 0';
      if (Number(item.costoUnitario) <= 0) err[`costo_${i}`] = 'Costo > 0';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (recepcion) {
        await receptionsService.update(recepcion.id, form);
      } else {
        await receptionsService.create(form);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar recepción');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="app-modal-overlay app-modal-overlay--padded">
      <div className="app-modal-shell app-modal-shell--md glass-card rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4 sticky top-0 bg-inherit z-10">
          {recepcion ? 'Edit Reception' : 'New Reception'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Proveedor, Fecha, Folio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-1">Proveedor *</label>
              {loadingSuppliers ? (
                <div className="glass-input w-full text-white/50">Cargando...</div>
              ) : (
                <select
                  className="glass-input w-full"
                  value={form.supplierId}
                  onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                >
                  <option value="">Choose</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              )}
              {errors.supplierId && <p className="text-red-300 text-xs mt-1">{errors.supplierId}</p>}
            </div>
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
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Comments</label>
            <textarea
              className="glass-input w-full"
              rows={2}
              value={form.comentarios || ''}
              onChange={(e) => setForm({ ...form, comentarios: e.target.value })}
            />
          </div>

          {/* Productos */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Products *</label>
            <div className="space-y-2 max-h-60 overflow-y-auto p-1">
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-white/5 p-2 rounded-xl">
                  <select
                    className="glass-input w-full"
                    value={item.productId}
                    onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                  >
                    <option value="">Product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.sku ? `(${p.sku})` : ''}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="Amount"
                    className="glass-input w-full"
                    value={item.cantidad}
                    onChange={(e) => updateItem(idx, 'cantidad', parseInt(e.target.value, 10) || 1)}
                  />
                  <div className="glass-input w-full bg-white/5 text-black/80 text-center py-2">
                  ${Number(item.costoUnitario || 0).toFixed(2)}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white text-sm font-mono">Subtotal: ${Number(item.subtotal || 0).toFixed(2)}</span>
                    <button type="button" onClick={() => removeItem(idx)} className="text-red-400">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="text-blue-300 text-sm mt-2">+ Add a product</button>
            {errors.items && <p className="text-red-300 text-xs mt-1">{errors.items}</p>}
          </div>

          {/* Total general */}
          {form.items.length > 0 && (
              <div className="text-right text-white font-bold text-lg border-t border-white/20 pt-2">
              Total: ${form.items.reduce((sum, i) => sum + Number(i.subtotal || 0), 0).toFixed(2)}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-2 sticky bottom-0 bg-inherit pb-2">
            <button type="button" onClick={onClose} className="products-violet-black-button px-4 py-2 rounded-full text-white font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="products-violet-black-button px-4 py-2 rounded-full text-white font-semibold">
              {loading ? 'Guardando...' : recepcion ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}