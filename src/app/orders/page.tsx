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
import { ClipboardList, Plus } from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { useAuth } from "@/context/AuthContext";
import { canAccessRoute, getDefaultRoute, getRouteByPath } from "@/routes/routeConfig";
import { usePathname, useRouter } from "next/navigation";

type StatusFilter = "all" | OrderStatus;

const itemsPerPage = 3;

const statusOptions: StatusFilter[] = ["all", "DRAFT", "CONFIRMED", "DELIVERED", "CANCELLED"];

const orderEmptyForm: OrderFormValues = {
  // folio: generado automáticamente por el backend
  fechaOrden: "",
  fechaEntrega: null,
  clienteId: "",
  comentarios: "",
  items: [
    {
      productId: "",
      cantidad: 1,
      precioUnitario: 0,
      productNombre: "",
      sku: "",
    },
  ],
};

function canConfirm(order: Order): boolean {
  return order.status === "DRAFT" && !!order.fechaEntrega;
}
function canEdit(order: Order): boolean {
  return order.status === "DRAFT";
}
function canDeliver(order: Order): boolean {
  return order.status === "CONFIRMED";
}
function canCancel(order: Order): boolean {
  return order.status === "CONFIRMED";
}
function canDelete(order: Order): boolean {
  return true;
}
function canView(order: Order): boolean {
  return order.status === "DELIVERED" || order.status === "CANCELLED";
}

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
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const requestSeqRef = useRef(0);
  const showPagination = totalItems > itemsPerPage;

  const { user, isLoading: isAuthLoading, isHydrated } = useAuth();  const pathname = usePathname();
  const router = useRouter();

  const routeConfig = getRouteByPath(pathname);
  useEffect(() => {
    if (!isHydrated || isAuthLoading) return;
    if (!user || !routeConfig || !canAccessRoute(user, routeConfig)) {
      router.replace(getDefaultRoute(user)); 
    }
  }, [user, isAuthLoading, isHydrated, router, routeConfig]);

  if (!isHydrated || isAuthLoading) return <Loading label="Cargando usuario..." />;

  if (!user || !routeConfig || !canAccessRoute(user, routeConfig)) {
    // mientras redirige o si no puede, no muestra la pantalla
    return null;
  }
  
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

  const handleOrderItemChange = (idx: number, field: string, value: any) => {
    setOrderForm((prev) => {
      const items = prev.items.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      );
      return { ...prev, items };
    });
  };

  const handleOrderItemProductSelect = (idx: number, productId: string) => {
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
    if (!order.fechaEntrega) {
      setStatusToast({ message: "Delivery date is required to confirm.", type: "error" });
      return;
    }
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

  const handleDelivered = async (order: Order) => {
    if (order.status !== "CONFIRMED") return;
    if (!order.fechaEntrega) {
      setStatusToast({ message: "Order must have a delivery date.", type: "error" });
      setIsProcessing(false);
      return;
    }
    setIsProcessing(true);
    try {
      await ordersService.deliver(order.id, order.fechaEntrega ?? "");
      setStatusToast({ message: "Order delivered successfully", type: "success" });
      await fetchOrders();
    } catch (error: any) {
      setStatusToast({ message: error?.response?.data?.message || "Error delivering order", type: "error" });
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
        },
      ],
    }));

  const handleRemoveOrderItem = (idx: number) =>
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    })
  );

  function validateOrderForm(form: OrderFormValues, clients: Client[], products: Product[]) {
    const errors: Record<string, string> = {};
    // folio: validación eliminada, se genera automáticamente
    if (!form.fechaOrden) errors.fechaOrden = "Order date is required";
    if (!form.clienteId || !clients.some(c => c.id === form.clienteId && c.activo)) {
      errors.clienteId = "Select an active client";
    }
    if (!Array.isArray(form.items) || form.items.length === 0) {
      errors.items = "Add at least 1 product";
    } else {
      form.items.forEach((item, idx) => {
        const product = products.find(p => p.id === item.productId);
        if (!item.productId) {
          errors[`items.${idx}.productId`] = "Select a product";
        } else if (!product || !product.activo || Number(product.stock) <= 0) {
          errors[`items.${idx}.productId`] = "Selected product is unavailable";
        }
        if (!item.cantidad || isNaN(Number(item.cantidad)) || Number(item.cantidad) < 1) {
          errors[`items.${idx}.cantidad`] = "Quantity must be at least 1";
        } else if (!Number.isInteger(Number(item.cantidad))) {
          errors[`items.${idx}.cantidad`] = "Quantity must be an integer";
        } else if (product && Number(item.cantidad) > Number(product.stock)) {
          errors[`items.${idx}.cantidad`] = `Maximum in stock: ${product.stock}`;
        }
        if (item.precioUnitario === undefined || item.precioUnitario === null || Number(item.precioUnitario) < 0) {
          errors[`items.${idx}.precioUnitario`] = "Price is required";
        }
      });
    }
    return errors;
  }

  const handleOrderSave = async () => {
    const errors = validateOrderForm(orderForm, activeClients, availableProducts);
    setOrderFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setToast({ message: "Please complete the fields", type: "error" });
      return;
    }
    setIsOrderSaving(true);
    try {
      const cleanItems = orderForm.items.map((item) => ({
        productId: String(item.productId || ""),
        cantidad: +item.cantidad,
        precioUnitario: +item.precioUnitario,
      }));
      const data: OrderFormValues = {
        ...orderForm,
        fechaEntrega: orderForm.fechaEntrega ?? null,
        items: cleanItems,
      };
      if (editingOrder) {
        await ordersService.update(editingOrder.id, data);
        setToast({ message: "Order updated successfully", type: "success" });
      } else {
        await ordersService.create(data);
        setToast({ message: "Order created successfully", type: "success" });
      }
      setIsOrderModalOpen(false);
      setOrderForm(orderEmptyForm);
      setEditingOrder(null);
      await fetchOrders();
    } catch (e: any) {
      setToast({
        message: e?.response?.data?.message || "Error saving order",
        type: "error",
      });
    } finally {
      setIsOrderSaving(false);
    }
  };

  const handleEditOrder = (order: Order) => {
    if (order.status !== "DRAFT") return;
    setEditingOrder(order);
    setOrderForm({
      // folio: no se edita, viene del registro existente
      fechaOrden: order.fechaOrden,
      fechaEntrega: order.fechaEntrega ?? null,
      clienteId: order.clienteId,
      comentarios: order.comentarios ?? "",
      items: order.items.map(item => ({
        productId: item.productId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        productNombre: item.productNombre,
        sku: item.sku,
      })),
    });
    setIsOrderModalOpen(true);
  };

  // Activos y filtrados
  const activeClients = clients.filter(c => !!c.activo);
  const availableProducts = products.filter(p => p.activo && Number(p.stock) > 0);

  const buttonBase = "inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";
  const iconButtonBase = "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/35 products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";
  
  // Counter chip setup (similar UX as in clients)
  let counterValue = totalItems;
  let counterLabel = "REGISTERED ORDERS";
  let counterClass = "bg-blue-50 text-indigo-900";
  let counterIcon = <ClipboardList className="h-4 w-4 text-indigo-500" />;
  if (statusFilter === "DRAFT") {
    counterLabel = "DRAFT ORDERS";
    counterValue = orders.filter(o => o.status === "DRAFT").length;
    counterClass = "bg-yellow-100 text-yellow-900";
  } else if (statusFilter === "CONFIRMED") {
    counterLabel = "CONFIRMED ORDERS";
    counterValue = orders.filter(o => o.status === "CONFIRMED").length;
    counterClass = "bg-blue-100 text-blue-900";
  } else if (statusFilter === "DELIVERED") {
    counterLabel = "DELIVERED ORDERS";
    counterValue = orders.filter(o => o.status === "DELIVERED").length;
    counterClass = "bg-emerald-200/80 text-emerald-700";
  } else if (statusFilter === "CANCELLED") {
    counterLabel = "CANCELLED ORDERS";
    counterValue = orders.filter(o => o.status === "CANCELLED").length;
    counterClass = "bg-rose-100 text-rose-800";
  }

  const total = orderForm.items.reduce((acc, item) => {
    const qty = Number(item.cantidad || 0);
    const price = Number(item.precioUnitario || 0);
    return acc + qty * price;
  }, 0);

  return (
    <div className="app-atmosphere relative min-h-full px-6 py-6 lg:px-10 rounded-3xl overflow-hidden">
      {toast && (
        <Toast message={toast.message} type={toast.type} duration={1000} onClose={() => setToast(null)} />
      )}
      {statusToast && (
        <Toast
          message={statusToast.message}
          type={statusToast.type}
          duration={1000}
          onClose={() => setStatusToast(null)}
        />
      )}
      <div className="mx-auto relative flex min-h-full w-full max-w-7xl flex-col gap-6 rounded-3xl">
        {/* HEADER */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-2xl flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                Orders
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Control and track your sales orders.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setOrderForm(orderEmptyForm);
              setIsOrderModalOpen(true);
              setEditingOrder(null);
            }}
            className="rounded-full px-6 py-2 text-base font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-[#392750] border border-white/50 shadow hover:bg-white/80 transition inline-flex items-center gap-2"
            disabled={isLoading}
          >
            <Plus className="h-5 w-5" /> Create
          </button>
        </div>
        {/* Counter CHIP */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className={`glass-chip inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] shadow border border-white/50 ${counterClass}`}>
              {counterIcon}
              {counterLabel}: <span className="ml-1 font-extrabold tracking-wide">{counterValue}</span>
            </span>
          </div>

          {/* PURE SEARCH + FILTER SELECT */}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                placeholder="Search by folio, client, comments..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                  void fetchOrders({ search: e.target.value, status: statusFilter, page: 1 });
                }}
                className="glass-input w-full max-w-xs"
                style={{ minWidth: 0 }}
              />
              <button
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                  void fetchOrders({ search: "", status: statusFilter, page: 1 });
                }}
                className={`${buttonBase} whitespace-nowrap`}
                disabled={isLoading}
              >
                Clear filter
              </button>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setCurrentPage(1);
                void fetchOrders({ search, status: e.target.value as StatusFilter, page: 1 });
              }}
              className="w-full sm:w-28 max-w-xs px-4 py-2 rounded-xl border glass-input shadow-sm text-base bg-white/70"
            >
              <option value="all">All</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* TABLES / CARDS */}
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
                        <td className="px-5 py-5 text-slate-700">{order.fechaOrden}</td>
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
                          }`}>{order.status}</span>
                        </td>
                        <td className="px-5 py-5 text-slate-800">${order.total.toFixed(2)}</td>
                        <td className="px-5 py-5 text-center">
                          <div className="inline-flex items-center gap-2">
                            {canEdit(order) && (
                              <button
                                onClick={() => handleEditOrder(order)}
                                className={iconButtonBase}
                                title="Edit"
                                aria-label="Edit order"
                              >
                                ✏️
                              </button>
                            )}
                            {!order.fechaEntrega && (
                              <span className="inline-flex items-center px-2 py-1 ml-2 text-xs font-bold text-yellow-800 bg-yellow-100 rounded-full">
                                Missing delivery date
                              </span>
                            )}
                            {canConfirm(order) && (
                              <button
                                onClick={() => handleConfirm(order)}
                                className={`${buttonBase} px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em]`}
                                disabled={isProcessing}
                              >
                                Confirm
                              </button>
                            )}
                            {canDeliver(order) && (
                              <button
                                onClick={() => handleDelivered(order)}
                                className={`${buttonBase} px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em]`}
                                disabled={isProcessing}
                              >
                                Delivered
                              </button>
                            )}
                            {canCancel(order) && (
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
                            {canView(order) && (
                              <button
                                onClick={() => setViewingOrder(order)}
                                className={iconButtonBase}
                                title="View order details"
                                aria-label="View order details"
                              >
                                👁️
                              </button>
                            )}
                            {canDelete(order) && (
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
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center text-slate-500">
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
                          }`}>{order.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <MobileMeta label="Date" value={order.fechaOrden} />
                      <MobileMeta label="Total" value={`$${order.total.toFixed(2)}`} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {canEdit(order) && (
                        <button
                          onClick={() => handleEditOrder(order)}
                          className={iconButtonBase}
                          title="Edit"
                          aria-label="Edit order"
                        >
                          ✏️
                        </button>
                      )}
                      {canConfirm(order) && (
                        <button
                          onClick={() => handleConfirm(order)}
                          className={`${buttonBase} px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em]`}
                          disabled={isProcessing}
                        >
                          Confirm
                        </button>
                      )}
                      {canDeliver(order) && (
                        <button
                          onClick={() => handleDelivered(order)}
                          className={`${buttonBase} px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em]`}
                          disabled={isProcessing}
                        >
                          Delivered
                        </button>
                      )}
                      {canCancel(order) && (
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
                      {canView(order) && (
                        <button
                          onClick={() => setViewingOrder(order)}
                          className={iconButtonBase}
                          title="View order details"
                          aria-label="View order details"
                        >
                          👁️
                        </button>
                      )}
                      {canDelete(order) && (
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
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/45 bg-white/35 px-4 py-10 text-center text-slate-500">
                  No orders registered
                </div>
              )}
            </div>
            {/* Pagination */}
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
                    ${currentPage === totalPages ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
                >Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* MODAL CREAR/EDITAR */}
      {isOrderModalOpen && (
        <Portal>
          <div className="app-modal-overlay app-modal-overlay--padded app-modal-overlay--form">
            <div className="app-modal-shell app-modal-shell--lg glass-card rounded-[28px] overflow-y-auto max-h-full scrollbar-none p-6 md:p-8">
              <div className="mb-5">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {editingOrder ? "Edit order" : "New order"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Make an order by adding products, selecting a client and confirming the date.
                </p>
              </div>
              <form
                className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-4"
                onSubmit={e => { e.preventDefault(); handleOrderSave(); }}
              >
                <div className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
                  <span>Folio</span>
                  <div className="glass-input w-full bg-white/10 text-slate-500 cursor-not-allowed select-none flex items-center gap-2">
                    {editingOrder
                      ? <span className="font-bold text-slate-700">{editingOrder.folio}</span>
                      : <span className="italic text-slate-400">Auto-generated on save</span>
                    }
                  </div>
                </div>
                <Field label="Order date" error={orderFormErrors.fechaOrden} className="">
                  <input
                    type="date"
                    name="fechaOrden"
                    className="glass-input w-full"
                    value={orderForm.fechaOrden}
                    onChange={handleOrderField}
                  />
                </Field>
                <Field label="Delivery date" error={orderFormErrors.fechaEntrega} className="">
                  <input
                    type="date"
                    name="fechaEntrega"
                    className="glass-input w-full"
                    min={orderForm.fechaOrden || undefined}
                    value={orderForm.fechaEntrega ?? ""}
                    onChange={(e) =>
                      setOrderForm((prev) => ({
                        ...prev,
                        fechaEntrega: e.target.value ? e.target.value : null,
                      }))
                    }
                  />
                </Field>
                <Field label="Client" error={orderFormErrors.clienteId} className="md:col-span-1">
                  <select
                    name="clienteId"
                    className="glass-input w-full"
                    value={orderForm.clienteId}
                    onChange={handleOrderClient}
                  >
                    <option value="">Select client...</option>
                    {activeClients.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Comments" error={orderFormErrors.comentarios} className="md:col-span-2">
                  <input
                    name="comentarios"
                    className="glass-input w-full"
                    value={orderForm.comentarios ?? ""}
                    onChange={handleOrderField}
                  />
                </Field>
                <div className="md:col-span-3">
                  <span className="block font-bold mb-1 text-slate-800 text-sm">Products</span>
                  <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto scrollbar-none">
                    {orderForm.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-nowrap gap-2 items-center rounded-2xl border border-white/40 bg-white/25 p-3"
                      >
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <select
                            value={item.productId}
                            onChange={e => handleOrderItemProductSelect(idx, e.target.value)}
                            className="glass-input w-full"
                            required
                          >
                            <option value="">Product...</option>
                            {availableProducts.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.nombre} ({p.sku}) {p.stock ? ` - ${p.stock} available` : ""}
                              </option>
                            ))}
                          </select>
                          {orderFormErrors[`items.${idx}.productId`] && (
                            <span className="text-xs text-rose-500">{orderFormErrors[`items.${idx}.productId`]}</span>
                          )}
                        </div>
                        <div className="shrink-0 flex flex-col gap-1">
                          <input
                            type="number"
                            min={1}
                            max={(() => {
                              const product = availableProducts.find(p => p.id === item.productId);
                              return product ? product.stock : undefined;
                            })()}
                            className="glass-input w-20"
                            placeholder="Qty"
                            value={item.cantidad}
                            onChange={e => handleOrderItemChange(idx, "cantidad", e.target.value)}
                            required
                          />
                          {orderFormErrors[`items.${idx}.cantidad`] && (
                            <span className="text-xs text-rose-500 w-20 text-center">{orderFormErrors[`items.${idx}.cantidad`]}</span>
                          )}
                        </div>
                        <span className="shrink-0 glass-input w-28 text-right bg-gray-100 cursor-not-allowed select-none">
                          ${item.precioUnitario}
                        </span>
                        <span className="shrink-0 w-24 text-right text-sm font-semibold text-slate-800">
                          ${(+(item.cantidad) * +(item.precioUnitario)).toFixed(2)}
                        </span>
                        <div className="shrink-0 flex w-9 items-center justify-center">
                          {orderForm.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOrderItem(idx)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/45 bg-white/35 text-slate-500 transition hover:bg-rose-50 hover:text-rose-500"
                              aria-label="Remove product"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={handleAddOrderItem} className={`${buttonBase} mt-2 h-9 px-4 text-sm`}>
                    + Add product
                  </button>
                  <div className="md:col-span-3 flex justify-end">
                    <div className="rounded-2xl border border-white/40 bg-white/25 px-4 py-2 text-sm font-bold text-slate-800">
                      Total: ${total.toFixed(2)}
                    </div>
                  </div>
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
        </Portal>
      )}
      {/* MODAL VER ORDEN (solo lectura) */}
      {viewingOrder && (
        <Portal>
          <div className="app-modal-overlay app-modal-overlay--padded app-modal-overlay--form">
            <div className="app-modal-shell app-modal-shell--lg glass-card rounded-[28px] overflow-y-auto max-h-full scrollbar-none p-6 md:p-8">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Order details</h2>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      viewingOrder.status === "DELIVERED"
                        ? "bg-emerald-200/80 text-emerald-700"
                        : "bg-rose-100 text-rose-800"
                    }`}>{viewingOrder.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Read-only view of the order.</p>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/45 bg-white/35 text-slate-500 hover:bg-white/60 transition font-bold"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-4">
                {/* Folio */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Folio</span>
                  <div className="glass-input bg-white/10 text-slate-700 font-bold cursor-default select-all">{viewingOrder.folio}</div>
                </div>
                {/* Order date */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Order date</span>
                  <div className="glass-input bg-white/10 text-slate-700 cursor-default">{viewingOrder.fechaOrden}</div>
                </div>
                {/* Delivery date */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Delivery date</span>
                  <div className="glass-input bg-white/10 text-slate-700 cursor-default">{viewingOrder.fechaEntrega || <span className="italic text-slate-400">—</span>}</div>
                </div>
                {/* Client */}
                <div className="flex flex-col gap-1 md:col-span-1">
                  <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Client</span>
                  <div className="glass-input bg-white/10 text-slate-700 cursor-default">{viewingOrder.clienteNombre}</div>
                </div>
                {/* Comments */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Comments</span>
                  <div className="glass-input bg-white/10 text-slate-700 cursor-default min-h-[40px]">{viewingOrder.comentarios || <span className="italic text-slate-400">—</span>}</div>
                </div>
                {/* Items */}
                <div className="md:col-span-3">
                  <span className="block text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500 mb-2">Products</span>
                  <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto scrollbar-none">
                    {viewingOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-wrap gap-2 items-center rounded-2xl border border-white/40 bg-white/25 p-3 text-sm"
                      >
                        <span className="flex-1 min-w-[160px] font-semibold text-slate-800">
                          {item.productNombre || item.productId}
                          {item.sku ? <span className="ml-2 text-xs text-slate-500 font-normal">({item.sku})</span> : null}
                        </span>
                        <span className="w-20 text-center text-slate-700">
                          <span className="text-xs text-slate-500 mr-1">Qty:</span>{item.cantidad}
                        </span>
                        <span className="w-28 text-right text-slate-700">
                          ${Number(item.precioUnitario).toFixed(2)}
                        </span>
                        <span className="w-24 text-right font-bold text-slate-800">
                          ${(Number(item.cantidad) * Number(item.precioUnitario)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <div className="rounded-2xl border border-white/40 bg-white/25 px-4 py-2 text-sm font-bold text-slate-800">
                      Total: ${viewingOrder.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
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