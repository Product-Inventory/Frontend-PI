'use client';

import { useState, useEffect, useRef } from 'react';
import { Portal } from '@/components/ui/Portal';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { receptionsService } from '@/services/receptions.service';
import { suppliersService } from '@/services/suppliers.service';
import { productsService } from '@/services/products.service';
import { Reception, ReceptionFormValues, ReceptionItem } from '@/types/reception';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recepcion?: Reception | null;
  setToast: (toast: { message: string; type: "success" | "error" } | null) => void;
}

export default function RecepcionFormModal({ isOpen, onClose, onSuccess, recepcion, setToast  }: Props) {
  const [form, setForm] = useState<ReceptionFormValues>({
    supplierId: '',
    fecha: new Date().toISOString().slice(0, 10),
    // folio: generado automáticamente por el backend
    comentarios: '',
    items: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: string; nombre: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; nombre: string; sku?: string; precioCompra?: number; precioVenta?: number }[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [permissionToast, setPermissionToast] = useState<{ message: string; type: "error" } | null>(null);
  const [permissionToastQueue, setPermissionToastQueue] = useState<string[]>([]);

  const enqueuePermissionToast = (message: string) => {
    setPermissionToastQueue((current) =>
      current.includes(message) ? current : [...current, message]
    );
  };

  const handlePermissionToastClose = () => {
    setPermissionToast(null);
  };

  useEffect(() => {
    if (permissionToast || permissionToastQueue.length === 0) return;

    const [nextMessage, ...rest] = permissionToastQueue;
    setPermissionToast({ message: nextMessage, type: "error" });
    setPermissionToastQueue(rest);
  }, [permissionToast, permissionToastQueue]);

  useEffect(() => {
    if (!isOpen) return;

    setPermissionToast(null);
    setPermissionToastQueue([]);

    setLoadingSuppliers(true);
    setLoadingProducts(true);

    suppliersService.getAll()
      .then(data => setSuppliers(data.items))
      .catch((err: any) => {
        const message = err?.response?.status === 403
          ? "You do not have permission to view suppliers"
          : (err?.response?.data?.message || "Error loading suppliers");
        if (err?.response?.status === 403) {
          enqueuePermissionToast(message);
          return;
        }

        setToast({ message, type: "error" });
      })
      .finally(() => setLoadingSuppliers(false));

    productsService.getAll()
      .then(data => {
        const items = data.items.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          sku: p.sku,
          precioCompra: p.precioCompra ?? 0,
          precioVenta: p.precioVenta ?? 0,
        }));
        setProducts(items);
      })
      .catch((err: any) => {
        const message = err?.response?.status === 403
          ? "You do not have permission to view products"
          : (err?.response?.data?.message || "Error loading products");
        if (err?.response?.status === 403) {
          enqueuePermissionToast(message);
          return;
        }

        setToast({ message, type: "error" });
      })
      .finally(() => setLoadingProducts(false));
  }, [isOpen]);

  useEffect(() => {
    if (recepcion) {
      setForm({
        supplierId: recepcion.supplierId,
        fecha: recepcion.fecha.slice(0, 10),
        // folio: no editable, viene del registro existente
        comentarios: recepcion.comentarios || '',
        items: recepcion.items.map(item => ({
          productId: item.productId,
          sku: item.sku,
          productNombre: item.productNombre,
          cantidad: item.cantidad,
          costoUnitario: item.costoUnitario,
          subtotal: item.subtotal,
        })),
      });
    } else {
      setForm({
        supplierId: '',
        fecha: new Date().toISOString().slice(0, 10),
        // folio: generado automáticamente por el backend
        comentarios: '',
        items:  [{
      productId: '',
      sku: '',
      productNombre: '',
      cantidad: 1,
      costoUnitario: 0,
      subtotal: 0,
    }],
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

  const updateItem = <K extends keyof ReceptionItem>(index: number, field: K, value: ReceptionItem[K]) => {
    setForm(prev => {
      const updatedItems = [...prev.items];
      const item = { ...updatedItems[index] };
      item[field] = value;

      if (field === 'productId') {
        const selected = products.find(p => p.id === value);
        if (selected) {
          item.sku = selected.sku || '';
          item.productNombre = selected.nombre;
          const cost = selected.precioCompra ?? selected.precioVenta ?? 0;
          item.costoUnitario = cost;
        } else {
          item.sku = '';
          item.productNombre = '';
          item.costoUnitario = 0;
        }
        // Conversión a número para evitar errores de tipo
        const cantidadNum = Number(item.cantidad) || 0;
        const costoNum = Number(item.costoUnitario) || 0;
        item.subtotal = cantidadNum * costoNum;
      }

      if (field === 'cantidad' || field === 'costoUnitario') {
        const cantidadNum = Number(item.cantidad) || 0;
        const costoNum = Number(item.costoUnitario) || 0;
        item.subtotal = cantidadNum * costoNum;
      }

      updatedItems[index] = item;
      return { ...prev, items: updatedItems };
    });
  };

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!form.supplierId) err.supplierId = 'Supplier is required';
    if (!form.fecha) err.fecha = 'Date is required';
    // folio: validación eliminada, se genera automáticamente
    if (form.items.length === 0) err.items = 'At least one product is required';

    // Conteo de duplicados para detectar el mismo producto en varias filas
    const productIdCount = new Map<string, number>();
    form.items.forEach((item) => {
      if (item.productId) {
        productIdCount.set(item.productId, (productIdCount.get(item.productId) || 0) + 1);
      }
    });

    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      if (!item.productId) {
        err[`product_${i}`] = 'Product is required';
      } else if ((productIdCount.get(item.productId) || 0) > 1) {
        err[`product_${i}`] = 'Product already added';
      }
      const cantidad = Number(item.cantidad);
      const costo = Number(item.costoUnitario);
      if (isNaN(cantidad) || cantidad <= 0) err[`cantidad_${i}`] = 'Quantity must be > 0';
      if (isNaN(costo) || costo <= 0) err[`costo_${i}`] = 'cost must be > 0';
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
        setToast({ message: "Reception updated successfully", type: "success" });
      } else {
        await receptionsService.create(form);
        setToast({ message: "Reception created successfully", type: "success" });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || "Error saving reception", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const buttonBase = "inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";

  const totalGeneral = form.items.reduce((sum, i) => sum + (i.subtotal || 0), 0);

  return (
    <Portal>
    <div className="app-modal-overlay app-modal-overlay--padded app-modal-overlay--form">
      {permissionToast && (
        <div className="fixed inset-x-0 z-[2147483647] flex flex-col items-center gap-4 px-4 pointer-events-none">
          <Toast
            message={permissionToast.message}
            type={permissionToast.type}
            duration={1500}
            portal={false}
            overlayClassName="w-full"
            shellClassName="w-full max-w-2xl"
            onClose={handlePermissionToastClose}
          />
        </div>
      )}
      <div className="app-modal-shell app-modal-shell--lg glass-card rounded-[28px] overflow-y-auto max-h-full scrollbar-none p-6 md:p-8">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {recepcion ? 'Edit Reception' : 'New Reception'}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {recepcion ? 'Modify reception details.' : 'Register a new inventory reception.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campos principales: proveedor, fecha, folio */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Supplier *</label>
              {loadingSuppliers ? (
                <div className="glass-input w-full flex items-center min-h-[2.5rem]">
                  <Spinner fullArea={false} size="sm" />
                </div>
              ) : (
                <select
                  className="glass-input w-full"
                  value={form.supplierId}
                  onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                >
                  <option value="">Select supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              )}
              {errors.supplierId && <p className="text-red-500 text-xs mt-1">{errors.supplierId}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Date *</label>
              <input
                type="date"
                className="glass-input w-full"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
              {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Folio</label>
              <div className="glass-input w-full bg-white/10 text-slate-500 cursor-not-allowed select-none flex items-center gap-2 min-h-[2.5rem] px-3">
                {recepcion
                  ? <span className="font-bold text-slate-700">{recepcion.folio}</span>
                  : <span className="italic text-slate-400">Auto-generated on save</span>
                }
              </div>
            </div>
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">Comments</label>
            <textarea
              className="glass-input w-full"
              rows={2}
              value={form.comentarios || ''}
              onChange={(e) => setForm({ ...form, comentarios: e.target.value })}
            />
          </div>

          {/* Productos */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Products *</label>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-white/30">
                  <tr className="text-left text-xs font-semibold text-slate-600">
                    <th className="px-2 py-2">Product</th>
                    <th className="px-2 py-2 text-center w-24">Quantity</th>
                    <th className="px-2 py-2 text-right w-28">Unit Cost</th>
                    <th className="px-2 py-2 text-right w-28">Subtotal</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item, idx) => (
                    <tr key={idx} className="border-t border-white/20">
                      <td className="px-2 py-2">
                        <select
                          className="glass-input w-full"
                          value={item.productId}
                          onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                        >
                          <option value="">Select product</option>
                          {products.map(p => {
                            const isAlreadySelected = form.items.some(
                              (otherItem, otherIdx) => otherItem.productId === p.id && otherIdx !== idx
                            );
                            return (
                              <option key={p.id} value={p.id} disabled={isAlreadySelected}>
                                {p.nombre} {p.sku ? `(${p.sku})` : ''}{isAlreadySelected ? ' (already added)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        {errors[`product_${idx}`] && <p className="text-red-500 text-xs">{errors[`product_${idx}`]}</p>}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          step="1"
                          min="1"
                          placeholder="Qty"
                          className="glass-input w-full text-center"
                          value={item.cantidad}
                          onChange={(e) => updateItem(idx, 'cantidad', parseFloat(e.target.value) || 0)}
                        />
                        {errors[`cantidad_${idx}`] && <p className="text-red-500 text-xs">{errors[`cantidad_${idx}`]}</p>}
                      </td>
                      <td className="px-2 py-2">
                        <div className="glass-input w-full bg-white/5 text-right py-2 px-3">
                          ${item.costoUnitario}
                        </div>
                        {errors[`costo_${idx}`] && <p className="text-red-500 text-xs">{errors[`costo_${idx}`]}</p>}
                      </td>
                      <td className="px-2 py-2 text-right font-semibold text-slate-800">
                        ${(item.subtotal || 0).toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/45 bg-white/35 text-slate-500 transition hover:bg-rose-50 hover:text-rose-500"
                            aria-label="Remove product"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addItem} className={`${buttonBase} mt-2 h-9 px-4 text-sm`}>
              + Add product
            </button>
            {errors.items && <p className="text-red-500 text-xs mt-1">{errors.items}</p>}
          </div>

          {form.items.length > 0 && (
            <div className="text-right text-lg font-bold text-slate-800 border-t border-white/30 pt-3">
              Total: ${totalGeneral.toFixed(2)}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className={buttonBase}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? 'Saving...' : recepcion ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}