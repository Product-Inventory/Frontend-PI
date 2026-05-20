"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Loading } from "@/components/ui/Loading";
import { Toast } from "@/components/ui/Toast";
import Navbar from "@/components/layout/Navbar";
import type { Order, OrderStatus, OrderFormValues } from "@/types/order";
import type { Client } from "@/types/client";
import type { Product } from "@/types/product";
import { clientsService } from "@/services/clients.service";
import { productsService } from "@/services/products.service";
import { ordersService } from "@/services/orders.service";
import { Box, ClipboardList, Pencil, Plus, Power, Trash2 } from "lucide-react";

type StatusFilter = "all" | OrderStatus;

const itemsPerPage = 3;

const statusOptions: StatusFilter[] = ["all", "DRAFT", "CONFIRMED", "DELIVERED", "CANCELLED"];

const orderEmptyForm: OrderFormValues = {
  folio: "",
  fecha: "",
  clienteId: "",
  comentarios: "",
  items: [
    {
      productId: "",
      cantidad: 1,
      precioUnitario: 0,
      productNombre: "",
      sku: "",
      subtotal: 0,
    },
  ],
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [statusToast, setStatusToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderFormValues>(orderEmptyForm);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderFormErrors, setOrderFormErrors] = useState<Record<string, string>>({});
  const [isOrderSaving, setIsOrderSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const requestSeqRef = useRef(0);

  const showPagination = totalItems > itemsPerPage;

  const fetchOrders = async (opts?: { search?: string; status?: StatusFilter; page?: number }) => {
    const requestSeq = ++requestSeqRef.current;
    const q = opts?.search !== undefined ? opts.search : search;
    const status = opts?.status !== undefined ? opts.status : statusFilter;
    const page = opts?.page !== undefined ? opts.page : currentPage;
    const params: any = {
      page,
      limit: itemsPerPage,
    };
    const trimmedSearch = String(q || "").trim();
    if (trimmedSearch) params.q = trimmedSearch;
    if (status && status !== "all") params.status = status;

    try {
      setIsLoading(true);
      const data = await ordersService.getAll(params);
      if (requestSeq !== requestSeqRef.current) return;
      setOrders(data.items || []);
      setTotalItems(data.total || 0);
      setTotalPages(Math.max(1, Math.ceil((data.total || 0) / (data.limit || itemsPerPage))));
    } catch (error: any) {
      if (requestSeq !== requestSeqRef.current) return;
      setToast({
        message: error?.response?.data?.message || "Error loading orders",
        type: "error",
      });
    } finally {
      if (requestSeq !== requestSeqRef.current) return;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchOrders();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search, statusFilter, currentPage]);
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);
  useEffect(() => { setCurrentPage(page => Math.min(page, totalPages)); }, [totalPages]);
  useEffect(() => {
    if (isOrderModalOpen) {
      if (clients.length === 0) clientsService.getAll({ limit: 100 }).then(res => setClients(res.items || []));
      if (products.length === 0) productsService.getAll({ limit: 100 }).then(res => setProducts(res.items || []));
    }
  }, [isOrderModalOpen]);

  const handleOrderField = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderClient = (e) => {
    setOrderForm((prev) => ({ ...prev, clienteId: e.target.value }));
  };

  const handleOrderItemChange = (idx, field, value) => {
    setOrderForm((prev) => {
      const items = prev.items.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      );
      return { ...prev, items };
    });
  };

  const handleOrderItemProductSelect = (idx, productId) => {
    const product = products.find((p) => p.id === productId);
    setOrderForm((prev) => {
      const items = prev.items.map((item, i) =>
        i === idx
          ? {
              ...item,
              productId,
              productNombre: product?.nombre || "",
              sku: product?.sku || "",
              precioUnitario: product?.precioVenta || 0,
            }
          : item
      );
      return { ...prev, items };
    });
  };

  const handleConfirm = async (order: Order) => {
    if (order.status !== "DRAFT") return;
    setIsProcessing(true);
    try {
      await ordersService.confirm(order.id);
      setStatusToast({ message: "Order confirmed successfully", type: "success" });
      await fetchOrders();
    } catch (error: any) {
      setStatusToast({ message: error?.response?.data?.message || "Error confirming order", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async (order: Order) => {
    if (order.status !== "CONFIRMED") return;
    setIsProcessing(true);
    try {
      await ordersService.cancel(order.id);
      setStatusToast({ message: "Order cancelled successfully", type: "success" });
      await fetchOrders();
    } catch (error: any) {
      setStatusToast({ message: error?.response?.data?.message || "Error cancelling order", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    if (orderToDelete.status !== "DRAFT") return;
    setIsProcessing(true);
    try {
      await ordersService.delete(orderToDelete.id);
      setToast({ message: "Order deleted successfully", type: "success" });
      setConfirmOpen(false);
      setOrderToDelete(null);
      await fetchOrders();
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error deleting order", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddOrderItem = () =>
    setOrderForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          cantidad: 1,
          precioUnitario: 0,
          productNombre: "",
          sku: "",
          subtotal: 0,
        },
      ],
    }));

  const handleRemoveOrderItem = (idx) =>
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));

  // Guardar la orden
  const handleOrderSave = async () => {
    setIsOrderSaving(true);
    try {
      const cleanItems = orderForm.items.map((item) => ({
        productId: item.productId,
        cantidad: +item.cantidad,
      }));
      const data: OrderFormValues = {
        ...orderForm,
        items: cleanItems,
      };
      if (editingOrder) {
        await ordersService.update(editingOrder.id, data);
      } else {
        await ordersService.create(data);
      }
      setIsOrderModalOpen(false);
      setOrderForm(orderEmptyForm);
      setEditingOrder(null);
      await fetchOrders();
    } catch (e) {
    } finally {
      setIsOrderSaving(false);
    }
  };

  const handleEditOrder = (order: Order) => {
    if (order.status !== "DRAFT") return;
    setEditingOrder(order);
    setOrderForm({
      folio: order.folio,
      fecha: order.fecha,
      clienteId: order.clienteId,
      comentarios: order.comentarios ?? "",
      items: order.items.map(item => ({
        productId: item.productId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        productNombre: item.productNombre,
        sku: item.sku,
        subtotal: item.subtotal,
      })),
    });
    setIsOrderModalOpen(true);
  };

  const buttonBase = "inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";
  const iconButtonBase = "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/35 products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";

  return (
    <div className="app-atmosphere min-h-full px-6 py-6 lg:px-10">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6">
        {toast && (
          <Toast message={toast.message} type={toast.type} duration={1000} onClose={() => setToast(null)} />
        )}
        {statusToast && (
          <Toast
            message={statusToast.message}
            type={statusToast.type}
            duration={1000}
            portal={false}
            overlayClassName="app-modal-overlay app-modal-overlay--padded app-alert-overlay--module"
            shellClassName="app-modal-shell--xl glass-card p-6 md:p-8"
            onClose={() => setStatusToast(null)}
          />
        )}

        {/* TOP BAR */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-md flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                Orders
              </h1>
              <p className="mt-1 text-sm text-slate-600">Control and track your sales orders.</p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 lg:min-w-[31rem]">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <div className="flex-1">
                <Navbar
                  search={search}
                  setSearch={(v: string) => {
                    setSearch(v);
                    setCurrentPage(1);
                    void fetchOrders({ search: v, status: statusFilter, page: 1 });
                  }}
                  moduleFilter={statusFilter}
                  setModuleFilter={(v: string) => {
                    const newStatus = v as StatusFilter;
                    setStatusFilter(newStatus);
                    setCurrentPage(1);
                    void fetchOrders({ search, status: newStatus, page: 1 });
                  }}
                  modules={statusOptions}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setCurrentPage(1);
                    void fetchOrders({ search: "", status: "all", page: 1 });
                  }}
                  className={`${buttonBase} w-full whitespace-nowrap min-w-[9rem] sm:w-auto`}
                  disabled={isLoading}
                >
                  Clear filter
                </button>
                <button
                  onClick={() => {
                    setOrderForm(orderEmptyForm);
                    setIsOrderModalOpen(true);
                  }}
                  className={`${buttonBase} w-full whitespace-nowrap min-w-[9rem] sm:w-auto`}
                  disabled={isLoading}
                >
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA DESKTOP */}
        {isLoading ? (
          <Loading label="Loading orders..." />
        ) : (
          <div className="glass-card overflow-hidden rounded-[30px]">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-white/25">
                  <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                    <th className="px-5 py-4">Folio</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Client</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="border-t border-white/18 transition hover:bg-white/10">
                        <td className="px-5 py-5 font-extrabold text-slate-800">{order.folio}</td>
                        <td className="px-5 py-5 text-slate-700">{order.fecha}</td>
                        <td className="px-5 py-5 text-slate-700">{order.clienteNombre}</td>
                        <td className="px-5 py-5">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            order.status === "DRAFT"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "CONFIRMED"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "DELIVERED"
                              ? "bg-emerald-200/80 text-emerald-700"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-slate-800">${order.total.toFixed(2)}</td>
                        <td className="px-5 py-5 text-center">
                          <div className="inline-flex items-center gap-2">
                            {order.status === "DRAFT" && (
                              <>
                                <button
                                  onClick={() => handleEditOrder(order)}
                                  className={iconButtonBase}
                                  title="Edit"
                                  aria-label="Edit order"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleConfirm(order)}
                                  className={`${buttonBase} px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em]`}
                                  disabled={isProcessing}
                                >
                                  Confirm
                                </button>
                              </>
                            )}
                            {order.status === "CONFIRMED" && (
                              <button
                                onClick={() => handleCancel(order)}
                                className={`${buttonBase} px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em]`}
                                disabled={isProcessing}
                                title="Cancel order"
                                aria-label="Cancel order"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setOrderToDelete(order);
                                setConfirmOpen(true);
                              }}
                              className={iconButtonBase}
                              title="Delete order"
                              aria-label="Delete order"
                              disabled={isProcessing}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center text-slate-500">
                        No orders registered
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="grid gap-4 p-4 md:hidden">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[24px] border border-white/45 bg-white/35 p-4 shadow-[0_8px_20px_rgba(138,108,198,0.12)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-slate-500">Folio</p>
                        <p className="mt-1 truncate text-lg font-extrabold text-slate-900">{order.folio}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{order.clienteNombre}</p>
                        <div className="mt-1">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            order.status === "DRAFT"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "CONFIRMED"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "DELIVERED"
                              ? "bg-emerald-200/80 text-emerald-700"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <MobileMeta label="Date" value={order.fecha} />
                      <MobileMeta label="Total" value={`$${order.total.toFixed(2)}`} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {order.status === "DRAFT" && (
                          <>
                            <button
                              onClick={() => handleEditOrder(order)}
                              className={iconButtonBase}
                              title="Edit"
                              aria-label="Edit order"
                            >
                              ✏️
                            </button>

                            <button
                              onClick={() => handleConfirm(order)}
                              className={`${buttonBase} px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em]`}
                              disabled={isProcessing}
                            >
                              Confirm
                            </button>
                          </>
                        )}

                        {order.status === "CONFIRMED" && (
                          <button
                            onClick={() => handleCancel(order)}
                            className={`${buttonBase} px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em]`}
                            disabled={isProcessing}
                            title="Cancel order"
                            aria-label="Cancel order"
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setOrderToDelete(order);
                            setConfirmOpen(true);
                          }}
                          className={iconButtonBase}
                          disabled={isProcessing}
                          title="Delete order"
                          aria-label="Delete order"
                        >
                          🗑️
                        </button>
                      </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/45 bg-white/35 px-4 py-10 text-center text-slate-500">
                  No orders registered
                </div>
              )}
            </div>
            {/* Paginación */}
            <div className="flex justify-between items-center mt-2 mb-4 border-t border-white/20 px-5 pt-4">
              <p className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={!showPagination || currentPage === 1}
                  className={`px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm products-violet-black-button
                  ${currentPage === 1 ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
                >Previous</button>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                  disabled={!showPagination || currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm products-violet-black-button
                  ${currentPage === 1 ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
                >Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {isOrderModalOpen && (
        <div className="app-modal-overlay app-modal-overlay--padded">
          <div className="app-modal-shell app-modal-shell--lg glass-card rounded-[28px] p-6 md:p-8">
          <div className="mb-5">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {editingOrder ? "Edit order" : "New order"} 
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                    Make a order adding products, selecting a client and confirming the date.
                </p>
            </div>            
            <form
              className="grid gap-x-3 gap-y-4 grid-cols-1 md:grid-cols-3 md:gap-y-3"
              onSubmit={e => { e.preventDefault(); handleOrderSave(); }}
            >
              <Field label="Folio" className="md:col-span-1">
                <input
                  name="folio"
                  className="glass-input w-full"
                  value={orderForm.folio}
                  onChange={handleOrderField}
                  required
                />
              </Field>
              <Field label="Date" className="md:col-span-1">
                <input
                  type="date"
                  name="fecha"
                  className="glass-input w-full"
                  value={orderForm.fecha}
                  onChange={handleOrderField}
                  required
                />
              </Field>
              <Field label="Client" className="md:col-span-1">
                <select
                  name="clienteId"
                  className="glass-input w-full"
                  value={orderForm.clienteId}
                  onChange={handleOrderClient}
                  required
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </Field>
              <Field label="Comments" className="md:col-span-3">
                <input
                  name="comentarios"
                  className="glass-input w-full"
                  value={orderForm.comentarios ?? ""}
                  onChange={handleOrderField}
                />
              </Field>
              <div className="md:col-span-3">
                <span className="block font-bold mb-1 text-slate-800 text-sm">Products</span>
                <div className="flex flex-col gap-2">
                  {orderForm.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap gap-2 items-center rounded-2xl border border-white/40 bg-white/25 p-3"
                    >
                      <select
                        value={item.productId}
                        onChange={e => handleOrderItemProductSelect(idx, e.target.value)}
                        className="glass-input"
                        required
                        style={{ minWidth: 160 }}
                      >
                        <option value="">Product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        className="glass-input w-20"
                        placeholder="Quantity"
                        value={item.cantidad}
                        onChange={e => handleOrderItemChange(idx, "cantidad", e.target.value)}
                        required
                      />
                      <span className="glass-input w-28 text-right bg-gray-100 cursor-not-allowed select-none">
                        ${item.precioUnitario}
                      </span>
                      <span className="block w-24 text-right">
                        ${(+(item.cantidad) * +(item.precioUnitario)).toFixed(2)}
                      </span>
                      {orderForm.items.length > 1 && (
                        <button type="button" onClick={() => handleRemoveOrderItem(idx)} className="ml-1 text-rose-500 font-bold">
                          ✖
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleAddOrderItem} className={`${buttonBase} mt-2 h-9 px-4 text-sm`}>
                  + Add product
                </button>
              </div>
              <div className="md:col-span-3 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsOrderModalOpen(false)} className="inline-flex h-10 items-center justify-center rounded-full border border-white/45 bg-white/45 px-5 text-sm font-semibold products-violet-black-button shadow-sm transition hover:bg-white/55">Cancel</button>
                <button type="submit" disabled={isOrderSaving} className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold products-violet-black-button shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60">
                  {isOrderSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirmOpen}
        title="Delete order"
        message={`Do you want to delete the order "${orderToDelete?.folio || ""}"?`}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          setConfirmOpen(false);
          setOrderToDelete(null);
        }}
        cancelButtonClassName="products-violet-black-button"
        confirmButtonClassName="products-violet-black-button"
      />
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 text-sm font-semibold text-slate-800 ${className}`}>
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

function MobileMeta({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/25 px-3 py-2">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-semibold text-slate-800 ${valueClassName || ""}`}>{value}</p>
    </div>
  );
}