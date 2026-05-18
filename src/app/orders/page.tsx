"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import Navbar from "@/components/layout/Navbar";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Loading } from "@/components/ui/Loading";
import { Toast } from "@/components/ui/Toast";

import { ordersService } from "@/services/orders.service";

import type {
    Order,
    OrderFormValues,
    OrderStatus,
} from "@/types/order";

import {
    ClipboardList,
    Plus,
    Trash2,
    CheckCircle2,
    XCircle,
} from "lucide-react";

type StatusFilter =
    | "all"
    | "DRAFT"
    | "CONFIRMED"
    | "DELIVERED"
    | "CANCELLED";

type OrderFormState = {
    folio: string;
    fecha: string;
    clienteId: string;
    comentarios: string;

    items: Array<{
        productId: string;
        productNombre: string;
        sku: string;
        cantidad: string;
        precioUnitario: string;
    }>;
};

type OrderFormErrors = {
    folio?: string;
    fecha?: string;
    clienteId?: string;
    items?: string;
};

const itemsPerPage = 9;

const emptyForm: OrderFormState = {
    folio: "",
    fecha: new Date().toISOString().split("T")[0],
    clienteId: "",
    comentarios: "",

    items: [
        {
            productId: "",
            productNombre: "",
            sku: "",
            cantidad: "1",
            precioUnitario: "0",
        },
    ],
};

const currency = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
});

function toFormState(order?: Order | null): OrderFormState {
    if (!order) return emptyForm;

    return {
        folio: order.folio || "",
        fecha: order.fecha || "",
        clienteId: order.clienteId || "",
        comentarios: order.comentarios || "",

        items:
            order.items?.map((item) => ({
                productId: item.productId,
                productNombre: item.productNombre,
                sku: item.sku,
                cantidad: String(item.cantidad),
                precioUnitario: String(item.precioUnitario),
            })) || [],
    };
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("all");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPages, setTotalPages] = useState(1);

    const [totalItems, setTotalItems] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingOrder, setEditingOrder] =
        useState<Order | null>(null);

    const [form, setForm] =
        useState<OrderFormState>(emptyForm);

    const [formErrors, setFormErrors] =
        useState<OrderFormErrors>({});

    const [isSaving, setIsSaving] = useState(false);

    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);

    const [orderToDelete, setOrderToDelete] =
        useState<Order | null>(null);

    const requestSeqRef = useRef(0);

    const showPagination = totalItems > itemsPerPage;

    const fetchOrders = async () => {
        const requestSeq = ++requestSeqRef.current;

        try {
            setIsLoading(true);

            const query: any = {
                page: currentPage,
                limit: itemsPerPage,
            };

            if (search.trim()) {
                query.q = search.trim();
            }

            if (statusFilter !== "all") {
                query.status = statusFilter;
            }

            const data = await ordersService.getAll(query);

            if (requestSeq !== requestSeqRef.current) return;

            setOrders(data.items || []);

            setTotalItems(data.total || 0);

            setTotalPages(
                Math.max(
                    1,
                    Math.ceil(
                        (data.total || 0) /
                            (data.limit || itemsPerPage)
                    )
                )
            );
        } catch (error: any) {
            console.error(error);

            setToast({
                message:
                    error?.response?.data?.message ||
                    "Error loading orders",
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchOrders();
    }, [search, statusFilter, currentPage]);

    const validateForm = () => {
        const errors: OrderFormErrors = {};

        if (!form.folio.trim()) {
            errors.folio = "Folio is required";
        }

        if (!form.fecha.trim()) {
            errors.fecha = "Date is required";
        }

        if (!form.clienteId.trim()) {
            errors.clienteId = "Client is required";
        }

        if (form.items.length === 0) {
            errors.items = "Add at least one item";
        }

        return errors;
    };

    const openCreate = () => {
        setEditingOrder(null);

        setForm(emptyForm);

        setFormErrors({});

        setIsModalOpen(true);
    };

    const openEdit = (order: Order) => {
        setEditingOrder(order);

        setForm(toFormState(order));

        setFormErrors({});

        setIsModalOpen(true);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleItemChange = (
        index: number,
        field: string,
        value: string
    ) => {
        setForm((current) => ({
            ...current,

            items: current.items.map((item, idx) =>
                idx === index
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item
            ),
        }));
    };

    const addItem = () => {
        setForm((current) => ({
            ...current,

            items: [
                ...current.items,

                {
                    productId: "",
                    productNombre: "",
                    sku: "",
                    cantidad: "1",
                    precioUnitario: "0",
                },
            ],
        }));
    };

    const removeItem = (index: number) => {
        setForm((current) => ({
            ...current,

            items: current.items.filter(
                (_, idx) => idx !== index
            ),
        }));
    };

    const total = form.items.reduce((acc, item) => {
        return (
            acc +
            Number(item.cantidad || 0) *
                Number(item.precioUnitario || 0)
        );
    }, 0);

    const handleSave = async () => {
        const errors = validateForm();

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) return;

        const payload: OrderFormValues = {
            folio: form.folio.trim(),

            fecha: form.fecha,

            clienteId: form.clienteId,

            comentarios:
                form.comentarios.trim() || null,

            items: form.items.map((item) => ({
                productId: item.productId,

                cantidad: Number(item.cantidad),

                precioUnitario: Number(
                    item.precioUnitario
                ),
            })),
        };

        try {
            setIsSaving(true);

            if (editingOrder) {
                await ordersService.update(
                    editingOrder.id,
                    payload
                );

                setToast({
                    message:
                        "Order updated successfully",
                    type: "success",
                });
            } else {
                await ordersService.create(payload);

                setToast({
                    message:
                        "Order created successfully",
                    type: "success",
                });
            }

            setIsModalOpen(false);

            setEditingOrder(null);

            setForm(emptyForm);

            await fetchOrders();
        } catch (error: any) {
            console.error(error);

            setToast({
                message:
                    error?.response?.data?.message ||
                    "Error saving order",
                type: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirm = async (order: Order) => {
        try {
            await ordersService.confirm(order.id);

            setToast({
                message:
                    "Order confirmed successfully",
                type: "success",
            });

            await fetchOrders();
        } catch (error: any) {
            console.error(error);

            setToast({
                message:
                    error?.response?.data?.message ||
                    "Error confirming order",
                type: "error",
            });
        }
    };

    const handleCancel = async (order: Order) => {
        try {
            await ordersService.cancel(order.id);

            setToast({
                message:
                    "Order cancelled successfully",
                type: "success",
            });

            await fetchOrders();
        } catch (error: any) {
            console.error(error);

            setToast({
                message:
                    error?.response?.data?.message ||
                    "Error cancelling order",
                type: "error",
            });
        }
    };

    const handleDelete = async () => {
        if (!orderToDelete) return;

        try {
            await ordersService.delete(
                orderToDelete.id
            );

            setToast({
                message:
                    "Order deleted successfully",
                type: "success",
            });

            setConfirmOpen(false);

            setOrderToDelete(null);

            await fetchOrders();
        } catch (error: any) {
            console.error(error);

            setToast({
                message:
                    error?.response?.data?.message ||
                    "Error deleting order",
                type: "error",
            });
        }
    };

    return (
        <div className="app-atmosphere relative min-h-full px-6 py-6 lg:px-10 rounded-3xl overflow-hidden">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    duration={1500}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="mx-auto flex max-w-7xl flex-col gap-6">

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2 rounded-2xl">
                            <ClipboardList className="h-6 w-6 text-black" />
                        </div>

                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900">
                                Orders
                            </h1>

                            <p className="text-sm text-slate-600">
                                Sales orders management
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Create
                    </button>
                </div>

                <Navbar
                    search={search}
                    setSearch={setSearch}
                    moduleFilter={statusFilter}
                    setModuleFilter={(v: string) =>
                        setStatusFilter(
                            v as StatusFilter
                        )
                    }
                    modules={[
                        "all",
                        "DRAFT",
                        "CONFIRMED",
                        "DELIVERED",
                        "CANCELLED",
                    ]}
                />

                {isLoading ? (
                    <Loading label="Loading orders..." />
                ) : (
                    <div className="glass-card overflow-hidden rounded-[40px]">
                        <table className="min-w-full text-sm">
                            <thead className="bg-white/25">
                                <tr>
                                    <th className="px-5 py-4 text-left">
                                        Folio
                                    </th>

                                    <th className="px-5 py-4 text-left">
                                        Client
                                    </th>

                                    <th className="px-5 py-4 text-left">
                                        Date
                                    </th>

                                    <th className="px-5 py-4 text-left">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-right">
                                        Total
                                    </th>

                                    <th className="px-5 py-4 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-t border-white/20"
                                        >
                                            <td className="px-5 py-5 font-bold">
                                                {order.folio}
                                            </td>

                                            <td className="px-5 py-5">
                                                {
                                                    order.clienteNombre
                                                }
                                            </td>

                                            <td className="px-5 py-5">
                                                {order.fecha}
                                            </td>

                                            <td className="px-5 py-5">
                                                {order.status}
                                            </td>

                                            <td className="px-5 py-5 text-right font-bold">
                                                {currency.format(
                                                    order.total
                                                )}
                                            </td>

                                            <td className="px-5 py-5">
                                                <div className="flex justify-center gap-2">

                                                    {order.status ===
                                                        "DRAFT" && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    openEdit(
                                                                        order
                                                                    )
                                                                }
                                                                className="rounded-full bg-white px-4 py-2 text-xs font-bold"
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    void handleConfirm(
                                                                        order
                                                                    )
                                                                }
                                                                className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white"
                                                            >
                                                                Confirm
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={() =>
                                                            void handleCancel(
                                                                order
                                                            )
                                                        }
                                                        className="rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white"
                                                    >
                                                        Cancel
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setOrderToDelete(
                                                                order
                                                            );

                                                            setConfirmOpen(
                                                                true
                                                            );
                                                        }}
                                                        className="rounded-full bg-red-500 p-2 text-white"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-12 text-center text-slate-500"
                                        >
                                            No orders found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="app-modal-overlay app-modal-overlay--padded">
                    <div className="app-modal-shell app-modal-shell--xl glass-card p-6">

                        <div className="mb-5">
                            <h2 className="text-2xl font-extrabold">
                                {editingOrder
                                    ? "Edit order"
                                    : "New order"}
                            </h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">

                            <Field
                                label="Folio"
                                error={formErrors.folio}
                            >
                                <input
                                    name="folio"
                                    value={form.folio}
                                    onChange={handleChange}
                                    className="glass-input w-full"
                                />
                            </Field>

                            <Field
                                label="Date"
                                error={formErrors.fecha}
                            >
                                <input
                                    type="date"
                                    name="fecha"
                                    value={form.fecha}
                                    onChange={handleChange}
                                    className="glass-input w-full"
                                />
                            </Field>

                            <div className="md:col-span-2">
                                <Field
                                    label="Client ID"
                                    error={
                                        formErrors.clienteId
                                    }
                                >
                                    <input
                                        name="clienteId"
                                        value={
                                            form.clienteId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="glass-input w-full"
                                    />
                                </Field>
                            </div>

                            <div className="md:col-span-2">
                                <Field label="Comments">
                                    <textarea
                                        name="comentarios"
                                        value={
                                            form.comentarios
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="glass-input min-h-24 w-full"
                                    />
                                </Field>
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold">
                                        Items
                                    </h3>

                                    <button
                                        onClick={addItem}
                                        className="rounded-full bg-blue-500 px-4 py-2 text-sm font-bold text-white"
                                    >
                                        Add item
                                    </button>
                                </div>

                                <div className="mt-4 flex flex-col gap-4">
                                    {form.items.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    index
                                                }
                                                className="grid gap-3 rounded-3xl border border-white/20 bg-white/20 p-4 md:grid-cols-5"
                                            >
                                                <input
                                                    placeholder="Product ID"
                                                    value={
                                                        item.productId
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleItemChange(
                                                            index,
                                                            "productId",
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    className="glass-input"
                                                />

                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Qty"
                                                    value={
                                                        item.cantidad
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleItemChange(
                                                            index,
                                                            "cantidad",
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    className="glass-input"
                                                />

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Price"
                                                    value={
                                                        item.precioUnitario
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleItemChange(
                                                            index,
                                                            "precioUnitario",
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    className="glass-input"
                                                />

                                                <div className="flex items-center font-bold">
                                                    {currency.format(
                                                        Number(
                                                            item.cantidad
                                                        ) *
                                                            Number(
                                                                item.precioUnitario
                                                            )
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        removeItem(
                                                            index
                                                        )
                                                    }
                                                    className="rounded-full bg-red-500 p-2 text-white"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="mt-5 flex justify-end">
                                    <div className="rounded-3xl border border-white/20 bg-white/20 px-5 py-4 text-right">
                                        <p className="text-sm text-slate-500">
                                            Total
                                        </p>

                                        <p className="text-2xl font-extrabold">
                                            {currency.format(
                                                total
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() =>
                                    setIsModalOpen(false)
                                }
                                className="rounded-full border border-white/20 bg-white/30 px-5 py-3"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white"
                            >
                                {isSaving
                                    ? "Saving..."
                                    : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                open={confirmOpen}
                title="Delete order"
                message={`Delete order "${orderToDelete?.folio}"?`}
                onConfirm={() => void handleDelete()}
                onCancel={() => {
                    setConfirmOpen(false);

                    setOrderToDelete(null);
                }}
            />
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
            <span>{label}</span>

            {children}

            {error ? (
                <span className="text-xs text-red-500">
                    {error}
                </span>
            ) : null}
        </label>
    );
}