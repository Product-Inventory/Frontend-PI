"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Loading } from "@/components/ui/Loading";
import { Toast } from "@/components/ui/Toast";
import { productsService } from "@/services/products.service";
import type { Product, ProductFormValues } from "@/types/product";
import { AlertTriangle, ChevronLeft, ChevronRight, Box, Pencil, Plus, Power, Search, Trash2 } from "lucide-react";

type StatusFilter = "all" | "active" | "inactive";

type ProductFormState = {
    sku: string;
    nombre: string;
    descripcion: string;
    categoria: string;
    unidad: string;
    marca: string;
    modelo: string;
    precioCompra: string;
    precioVenta: string;
    stock: string;
    stockMinimo: string;
    activo: boolean;
};

type ProductFormErrors = Partial<Record<keyof ProductFormState, string>>;

const itemsPerPage = 3;

const emptyForm: ProductFormState = {
    sku: "",
    nombre: "",
    descripcion: "",
    categoria: "",
    unidad: "",
    marca: "",
    modelo: "",
    precioCompra: "0",
    precioVenta: "0",
    stock: "0",
    stockMinimo: "0",
    activo: true,
};

const currency = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
});

function toFormState(product?: Product | null): ProductFormState {
    if (!product) return emptyForm;

    return {
        sku: product.sku || "",
        nombre: product.nombre || "",
        descripcion: product.descripcion || "",
        categoria: product.categoria || "",
        unidad: product.unidad || "",
        marca: product.marca || "",
        modelo: product.modelo || "",
        precioCompra: String(product.precioCompra ?? 0),
        precioVenta: String(product.precioVenta ?? 0),
        stock: String(product.stock ?? 0),
        stockMinimo: String(product.stockMinimo ?? 0),
        activo: product.activo ?? true,
    };
}

function isNonNegativeNumber(value: string) {
    if (value.trim() === "") return false;
    const parsed = Number(value);
    return !Number.isNaN(parsed) && parsed >= 0;
}

function normalizeOptionalText(value: string) {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form, setForm] = useState<ProductFormState>(emptyForm);
    const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const lowStockCount = useMemo(
        () => products.filter((product) => Number(product.stock || 0) <= Number(product.stockMinimo || 0)).length,
        [products]
    );

    const showPagination = totalItems > itemsPerPage;

    const buildQuery = () => {
        const query: Record<string, string | number | boolean> = {
            page: currentPage,
            limit: itemsPerPage,
        };

        const trimmedSearch = search.trim();

        if (trimmedSearch) query.q = trimmedSearch;
        if (statusFilter === "active") query.activo = true;
        if (statusFilter === "inactive") query.activo = false;

        return query;
    };

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const data = await productsService.getAll(buildQuery());
            const items = data.items || [];

            setProducts(items);
            setTotalItems(data.total || 0);
            setTotalPages(Math.max(1, Math.ceil((data.total || 0) / (data.limit || itemsPerPage))));
        } catch (error: any) {
            console.error("Error loading products:", error);
            setToast({ message: error?.response?.data?.message || "Error loading products", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchProducts();
        }, 250);

        return () => window.clearTimeout(timer);
    }, [search, statusFilter, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    const validateForm = () => {
        const nextErrors: ProductFormErrors = {};

        const sku = form.sku.trim();
        const nombre = form.nombre.trim();

        if (!sku) nextErrors.sku = "SKU is required";
        else if (sku.length < 2) nextErrors.sku = "SKU must have at least 2 characters";

        if (!nombre) nextErrors.nombre = "Name is required";
        else if (nombre.length < 2) nextErrors.nombre = "Name must have at least 2 characters";

        if (!isNonNegativeNumber(form.precioCompra)) nextErrors.precioCompra = "Enter a valid purchase price";
        if (!isNonNegativeNumber(form.precioVenta)) nextErrors.precioVenta = "Enter a valid sale price";
        if (!isNonNegativeNumber(form.stock)) nextErrors.stock = "Enter a valid stock value";
        if (!isNonNegativeNumber(form.stockMinimo)) nextErrors.stockMinimo = "Enter a valid minimum stock";

        return nextErrors;
    };

    const openCreate = () => {
        setEditingProduct(null);
        setForm(emptyForm);
        setFormErrors({});
        setIsModalOpen(true);
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        setForm(toFormState(product));
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleChange = (event: any) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSave = async () => {
        const nextErrors = validateForm();
        setFormErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            setToast({ message: "Review the highlighted fields before saving", type: "error" });
            return;
        }

        const payload: ProductFormValues = {
            sku: form.sku.trim(),
            nombre: form.nombre.trim(),
            descripcion: normalizeOptionalText(form.descripcion),
            categoria: normalizeOptionalText(form.categoria),
            unidad: normalizeOptionalText(form.unidad),
            marca: normalizeOptionalText(form.marca),
            modelo: normalizeOptionalText(form.modelo),
            precioCompra: Number(form.precioCompra),
            precioVenta: Number(form.precioVenta),
            stock: Number(form.stock),
            stockMinimo: Number(form.stockMinimo),
            activo: form.activo,
        };

        try {
            setIsSaving(true);

            if (editingProduct) {
                await productsService.update(editingProduct.id, payload);
                setToast({ message: "Product updated successfully", type: "success" });
            } else {
                await productsService.create(payload);
                setToast({ message: "Product created successfully", type: "success" });
            }

            setIsModalOpen(false);
            setEditingProduct(null);
            setForm(emptyForm);
            await fetchProducts();
        } catch (error: any) {
            console.error(error);
            setToast({ message: error?.response?.data?.message || "Error saving product", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async (product: Product) => {
        try {
            await productsService.toggleActive(product.id, !product.activo);
            setToast({
                message: product.activo ? "Product deactivated successfully" : "Product activated successfully",
                type: "success",
            });
            await fetchProducts();
        } catch (error: any) {
            console.error(error);
            setToast({ message: error?.response?.data?.message || "Error changing product status", type: "error" });
        }
    };

    const handleDelete = async () => {
        if (!productToDelete) return;

        try {
            await productsService.delete(productToDelete.id);
            setToast({ message: "Product deleted successfully", type: "success" });
            setConfirmOpen(false);
            setProductToDelete(null);
            await fetchProducts();
        } catch (error: any) {
            console.error(error);
            setToast({ message: error?.response?.data?.message || "Error deleting product", type: "error" });
        }
    };

    const buttonBase = "inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-sm font-semibold !text-[#9a7ef0] shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";
    const iconButtonBase = "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/35 !text-[#9a7ef0] shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";

    return (
        <div className="app-atmosphere min-h-full px-6 py-6 lg:px-10">
            <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6">
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        duration={3000}
                        onClose={() => setToast(null)}
                    />
                )}

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2 rounded-md flex items-center justify-center">
                            <Box className="h-6 w-6 text-black" />
                        </div>

                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                                Products
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                Catalog ready for inventory and receptions.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:min-w-[31rem]">
                        <div className="grid gap-3 md:grid-cols-[1.6fr_0.9fr]">
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                    <Search className="h-4 w-4" />
                                </span>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search..."
                                    className="w-full rounded-full border border-white/45 bg-white/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-[0_6px_18px_rgba(138,108,198,0.12)] outline-none backdrop-blur-md placeholder:text-slate-400 focus:border-white/70"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                                className="w-full rounded-full border border-white/45 bg-white/50 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_6px_18px_rgba(138,108,198,0.12)] outline-none backdrop-blur-md focus:border-white/70"
                            >
                                <option value="all">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                Low stock visible: {lowStockCount}
                            </span>

                            <button onClick={openCreate} className={buttonBase}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <Loading label="Loading products..." />
                ) : (
                    <div className="glass-card overflow-hidden rounded-[30px]">
                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full text-sm">
                                <thead className="bg-white/25">
                                    <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                                        <th className="px-5 py-4">SKU</th>
                                        <th className="px-5 py-4">Name</th>
                                        <th className="px-5 py-4">Category</th>
                                        <th className="px-5 py-4">Unit</th>
                                        <th className="px-5 py-4">Brand</th>
                                        <th className="px-5 py-4">Purchase price</th>
                                        <th className="px-5 py-4">Sale price</th>
                                        <th className="px-5 py-4">Stock</th>
                                        <th className="px-5 py-4">Minimum stock</th>
                                        <th className="px-5 py-4 text-center">Status</th>
                                        <th className="px-5 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {products.length > 0 ? (
                                        products.map((product) => {
                                            const lowStock = Number(product.stock || 0) <= Number(product.stockMinimo || 0);

                                            return (
                                                <tr
                                                    key={product.id}
                                                    className={`border-t border-white/18 transition ${lowStock ? "bg-amber-50/75" : "hover:bg-white/10"}`}
                                                >
                                                    <td className="px-5 py-5 font-extrabold text-slate-800">{product.sku}</td>
                                                    <td className="px-5 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-semibold text-slate-800">{product.nombre}</span>
                                                            {lowStock && (
                                                                <span className="inline-flex w-fit items-center rounded-full border border-rose-300 bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold tracking-[0.22em] text-rose-500">
                                                                    LOW
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-5 text-slate-700">{product.categoria || "-"}</td>
                                                    <td className="px-5 py-5 text-slate-700">{product.unidad || "-"}</td>
                                                    <td className="px-5 py-5 text-slate-700">{product.marca || "-"}</td>
                                                    <td className="px-5 py-5 font-semibold text-slate-800">{currency.format(Number(product.precioCompra || 0))}</td>
                                                    <td className="px-5 py-5 font-semibold text-slate-800">{currency.format(Number(product.precioVenta || 0))}</td>
                                                    <td className="px-5 py-5">
                                                        <span className={`font-extrabold ${lowStock ? "text-rose-600" : "text-slate-800"}`}>
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-5 font-semibold text-slate-800">{product.stockMinimo}</td>
                                                    <td className="px-5 py-5 text-center">
                                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${product.activo ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"}`}>
                                                            {product.activo ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-5 text-center">
                                                        <div className="inline-flex items-center gap-2">
                                                            <button
                                                                onClick={() => openEdit(product)}
                                                                className={iconButtonBase}
                                                                title="Edit"
                                                                aria-label="Edit product"
                                                            >
                                                                ✏️
                                                            </button>

                                                            <button
                                                                onClick={() => void handleToggleActive(product)}
                                                                className={`${buttonBase} px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em]`}
                                                                title={product.activo ? "Deactivate" : "Activate"}
                                                                aria-label={product.activo ? "Deactivate product" : "Activate product"}
                                                            >
                                                                <Power className="mr-1 h-3.5 w-3.5" />
                                                                {product.activo ? "Off" : "On"}
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setProductToDelete(product);
                                                                    setConfirmOpen(true);
                                                                }}
                                                                className={iconButtonBase}
                                                                title="Delete"
                                                                aria-label="Delete product"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={11} className="px-5 py-14 text-center text-slate-500">
                                                No products registered
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-4 p-4 md:hidden">
                            {products.length > 0 ? (
                                products.map((product) => {
                                    const lowStock = Number(product.stock || 0) <= Number(product.stockMinimo || 0);

                                    return (
                                        <article
                                            key={product.id}
                                            className={`rounded-[24px] border border-white/45 bg-white/35 p-4 shadow-[0_8px_20px_rgba(138,108,198,0.12)] ${lowStock ? "ring-2 ring-rose-200" : ""}`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-slate-500">SKU</p>
                                                    <p className="mt-1 truncate text-lg font-extrabold text-slate-900">{product.sku}</p>
                                                    <p className="mt-1 text-base font-semibold text-slate-800">{product.nombre}</p>
                                                </div>

                                                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${product.activo ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"}`}>
                                                    {product.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                                <MobileMeta label="Category" value={product.categoria || "-"} />
                                                <MobileMeta label="Unit" value={product.unidad || "-"} />
                                                <MobileMeta label="Brand" value={product.marca || "-"} />
                                                <MobileMeta label="Stock" value={String(product.stock)} valueClassName={lowStock ? "text-rose-600" : "text-slate-800"} />
                                                <MobileMeta label="Minimum stock" value={String(product.stockMinimo)} />
                                                <MobileMeta label="Purchase price" value={currency.format(Number(product.precioCompra || 0))} />
                                                <MobileMeta label="Sale price" value={currency.format(Number(product.precioVenta || 0))} />
                                            </div>

                                            {lowStock && (
                                                <div className="mt-4 inline-flex items-center rounded-full border border-rose-300 bg-rose-100 px-3 py-1 text-[10px] font-extrabold tracking-[0.22em] text-rose-500">
                                                    LOW STOCK
                                                </div>
                                            )}

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => openEdit(product)}
                                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/45 bg-white/45 px-4 py-2 text-sm font-semibold !text-[#9a7ef0] shadow-[0_6px_18px_rgba(138,108,198,0.14)]"
                                                >
                                                    ✏️
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => void handleToggleActive(product)}
                                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/45 bg-white/45 px-4 py-2 text-sm font-semibold !text-[#9a7ef0] shadow-[0_6px_18px_rgba(138,108,198,0.14)]"
                                                >
                                                    <Power className="h-4 w-4" />
                                                    {product.activo ? "Off" : "On"}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setProductToDelete(product);
                                                        setConfirmOpen(true);
                                                    }}
                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/45 !text-[#9a7ef0] shadow-[0_6px_18px_rgba(138,108,198,0.14)]"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })
                            ) : (
                                <div className="rounded-[24px] border border-white/45 bg-white/35 px-4 py-10 text-center text-slate-500">
                                    No products registered
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mt-4 border-t border-white/20 px-5 pt-4">
                            <p className="text-sm text-gray-400">
                                Page {currentPage} of {totalPages}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                                    disabled={!showPagination || currentPage === 1}
                                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm !text-[#9a7ef0] disabled:opacity-20"
                                >
                                    Previous
                                </button>

                                <button
                                    onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                                    disabled={!showPagination || currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm !text-[#9a7ef0] disabled:opacity-20"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
                    <div className="glass-card w-full max-w-5xl rounded-[28px] p-6 md:p-8">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                    {editingProduct ? "Edit product" : "New product"}
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    Capture SKU, name, prices, and stock to connect with inventory.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="inline-flex h-10 items-center justify-center rounded-full border border-white/45 bg-white/45 px-4 text-sm font-semibold !text-[#9a7ef0] shadow-sm transition hover:bg-white/55"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="SKU" error={formErrors.sku}>
                                <input name="sku" value={form.sku} onChange={handleChange} className="glass-input w-full" placeholder="PRD-001" />
                            </Field>

                            <Field label="Name" error={formErrors.nombre}>
                                <input name="nombre" value={form.nombre} onChange={handleChange} className="glass-input w-full" placeholder="Laptop Pro 15" />
                            </Field>

                            <Field label="Category">
                                <input name="categoria" value={form.categoria} onChange={handleChange} className="glass-input w-full" placeholder="Electronics" />
                            </Field>

                            <Field label="Unit">
                                <input name="unidad" value={form.unidad} onChange={handleChange} className="glass-input w-full" placeholder="pcs" />
                            </Field>

                            <Field label="Brand">
                                <input name="marca" value={form.marca} onChange={handleChange} className="glass-input w-full" placeholder="Dell" />
                            </Field>

                            <Field label="Model">
                                <input name="modelo" value={form.modelo} onChange={handleChange} className="glass-input w-full" placeholder="XPS 15" />
                            </Field>

                            <Field label="Purchase price" error={formErrors.precioCompra}>
                                <input name="precioCompra" type="number" min="0" step="0.01" value={form.precioCompra} onChange={handleChange} className="glass-input w-full" />
                            </Field>

                            <Field label="Sale price" error={formErrors.precioVenta}>
                                <input name="precioVenta" type="number" min="0" step="0.01" value={form.precioVenta} onChange={handleChange} className="glass-input w-full" />
                            </Field>

                            <Field label="Stock" error={formErrors.stock}>
                                <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} className="glass-input w-full" />
                            </Field>

                            <Field label="Minimum stock" error={formErrors.stockMinimo}>
                                <input name="stockMinimo" type="number" min="0" step="1" value={form.stockMinimo} onChange={handleChange} className="glass-input w-full" />
                            </Field>

                            <div className="md:col-span-2">
                                <Field label="Description">
                                    <textarea
                                        name="descripcion"
                                        value={form.descripcion}
                                        onChange={handleChange}
                                        className="glass-input w-full min-h-28"
                                        placeholder="Optional product description"
                                    />
                                </Field>
                            </div>

                            <div className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-white/40 bg-white/25 px-4 py-3">
                                <input
                                    type="checkbox"
                                    name="activo"
                                    checked={form.activo}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-white/60 text-[#9a7ef0] focus:ring-[#9a7ef0]"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Active product</p>
                                    <p className="text-xs text-slate-600">You can activate or deactivate the product without deleting it.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="inline-flex h-10 items-center justify-center rounded-full border border-white/45 bg-white/45 px-5 text-sm font-semibold !text-[#9a7ef0] shadow-sm transition hover:bg-white/55"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold !text-[#9a7ef0] shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                open={confirmOpen}
                title="Delete product"
                message={`Do you want to delete the product "${productToDelete?.nombre || ""}"?`}
                onConfirm={() => void handleDelete()}
                onCancel={() => {
                    setConfirmOpen(false);
                    setProductToDelete(null);
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
