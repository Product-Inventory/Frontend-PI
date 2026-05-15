"use client";

import { useEffect, useState, type ReactNode } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Loading } from "@/components/ui/Loading";
import { Toast } from "@/components/ui/Toast";
import { productsService } from "@/services/products.service";
import type { Product, ProductFormValues } from "@/types/product";
import { ChevronLeft, ChevronRight, Box, Pencil, Plus, Power, Search, Trash2 } from "lucide-react";

type StatusFilter = "all" | "active" | "inactive";

type ProductFormState = {
    sku: string;
    nombre: string;
    descripcion: string;
    categoria: string;
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
    marca: "",
    modelo: "",
    precioCompra: "",
    precioVenta: "",
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

function isPositiveNumber(value: string) {
    if (value.trim() === "") return false;
    const parsed = Number(value);
    return !Number.isNaN(parsed) && parsed > 0;
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
    const [validationToast, setValidationToast] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

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
        const categoria = form.categoria.trim();

        if (!sku) nextErrors.sku = "SKU is required";
        else if (sku.length < 2) nextErrors.sku = "SKU must have at least 2 characters";

        if (!nombre) nextErrors.nombre = "Name is required";
        else if (nombre.length < 2) nextErrors.nombre = "Name must have at least 2 characters";

        if (!categoria) nextErrors.categoria = "Category is required";

        if (!isPositiveNumber(form.precioCompra)) nextErrors.precioCompra = "Purchase price must be greater than 0";
        if (!isPositiveNumber(form.precioVenta)) nextErrors.precioVenta = "Sale price must be greater than 0";
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
        const requiredMissing = [
            form.sku.trim(),
            form.nombre.trim(),
            form.categoria.trim(),
            form.precioCompra.trim(),
            form.precioVenta.trim(),
            form.stock.trim(),
            form.stockMinimo.trim(),
        ].some((v) => v === "");

        setFormErrors(nextErrors);

        if (requiredMissing) {
            setValidationToast("All fields are required");
            window.setTimeout(() => setValidationToast(null), 2000);
            return;
        }

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        const payload: ProductFormValues = {
            sku: form.sku.trim(),
            nombre: form.nombre.trim(),
            descripcion: normalizeOptionalText(form.descripcion),
            categoria: normalizeOptionalText(form.categoria),
            unidad: null,
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

    const buttonBase = "inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";
    const iconButtonBase = "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/35 products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";

    return (
        <div className="app-atmosphere relative min-h-full px-6 py-6 lg:px-10 rounded-3xl overflow-hidden">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    duration={1000}
                    portal={false}
                    overlayClassName="app-alert-overlay--module"
                    onClose={() => setToast(null)}
                />
            )}
            <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 rounded-3xl">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2 rounded-2xl flex items-center justify-center">
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
                        <div className="flex items-center justify-end gap-3">
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
                    <div className="glass-card overflow-hidden rounded-[40px]">
                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full text-sm">
                                <thead className="bg-white/25">
                                    <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                                        <th className="px-5 py-4">SKU</th>
                                        <th className="px-5 py-4">Name</th>
                                        <th className="px-5 py-4">Category</th>
                                        <th className="px-5 py-4">Brand</th>
                                        <th className="px-5 py-4">Purchase price</th>
                                        <th className="px-5 py-4">Sale price</th>
                                        <th className="px-5 py-4 text-center">Status</th>
                                        <th className="px-5 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {products.length > 0 ? (
                                        products.map((product) => {
                                            return (
                                                <tr
                                                    key={product.id}
                                                    className="border-t border-white/18 transition hover:bg-white/10"
                                                >
                                                    <td className="px-5 py-5 font-extrabold text-slate-800">{product.sku}</td>
                                                    <td className="px-5 py-5">
                                                        <span className="font-semibold text-slate-800">{product.nombre}</span>
                                                    </td>
                                                    <td className="px-5 py-5 text-slate-700">{product.categoria || "-"}</td>
                                                    <td className="px-5 py-5 text-slate-700">{product.marca || "-"}</td>
                                                    <td className="px-5 py-5 font-semibold text-slate-800">{currency.format(Number(product.precioCompra || 0))}</td>
                                                    <td className="px-5 py-5 font-semibold text-slate-800">{currency.format(Number(product.precioVenta || 0))}</td>
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
                                            <td colSpan={8} className="px-5 py-14 text-center text-slate-500">
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
                                    return (
                                        <article
                                            key={product.id}
                                            className="rounded-3xl border border-white/45 bg-white/35 p-4 shadow-[0_8px_20px_rgba(138,108,198,0.12)]"
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
                                                <MobileMeta label="Category" value={product.categoria || "-"} rounded="rounded-2xl" />
                                                <MobileMeta label="Brand" value={product.marca || "-"} rounded="rounded-2xl" />
                                                <MobileMeta label="Purchase price" value={currency.format(Number(product.precioCompra || 0))} rounded="rounded-2xl" />
                                                <MobileMeta label="Sale price" value={currency.format(Number(product.precioVenta || 0))} rounded="rounded-2xl" />
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => openEdit(product)}
                                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/45 bg-white/45 px-4 py-2 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)]"
                                                >
                                                    ✏️
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => void handleToggleActive(product)}
                                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/45 bg-white/45 px-4 py-2 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)]"
                                                >
                                                    <Power className="h-4 w-4" />
                                                    {product.activo ? "Off" : "On"}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setProductToDelete(product);
                                                        setConfirmOpen(true);
                                                    }}
                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/45 products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)]"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })
                            ) : (
                                <div className="rounded-3xl border border-white/45 bg-white/35 px-4 py-10 text-center text-slate-500">
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
                                    className="px-4 py-2 rounded-2xl border border-gray-200 bg-white shadow-sm products-violet-black-button disabled:opacity-20"
                                >
                                    Previous
                                </button>

                                <button
                                    onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                                    disabled={!showPagination || currentPage === totalPages}
                                    className="px-4 py-2 rounded-2xl border border-gray-200 bg-white shadow-sm products-violet-black-button disabled:opacity-20"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {isModalOpen && (
                <div className="app-modal-overlay app-modal-overlay--padded">
                    <div className="app-modal-shell app-modal-shell--xl glass-card relative p-6 md:p-8">
                        {validationToast && (
                            <Toast
                                message={validationToast}
                                type="error"
                                duration={1000}
                                onClose={() => setValidationToast(null)}
                                portal={false}
                                overlayClassName="app-alert-overlay--module"
                                shellClassName="app-alert-shell--error"
                                subtitleClassName="app-alert-subtitle--error"
                                progressClassName="app-alert-progress--error"
                            />
                        )}

                        <div className="mb-5">
                            <h2 className="text-2xl font-extrabold tracking-tight text-[#392750]">
                                {editingProduct ? "Edit product" : "New product"}
                            </h2>
                            <p className="mt-1 text-sm text-[#392750]">
                                Manage product details including pricing and status.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="SKU *" error={formErrors.sku}>
                                <input name="sku" value={form.sku} onChange={handleChange} className="glass-input w-full" placeholder="PRD-001" />
                            </Field>

                            <Field label="Name *" error={formErrors.nombre}>
                                <input name="nombre" value={form.nombre} onChange={handleChange} className="glass-input w-full" placeholder="Laptop Pro 15" />
                            </Field>

                            <Field label="Category *" error={formErrors.categoria}>
                                <input name="categoria" value={form.categoria} onChange={handleChange} className="glass-input w-full" placeholder="Electronics" />
                            </Field>

                            <Field label="Brand">
                                <input name="marca" value={form.marca} onChange={handleChange} className="glass-input w-full" placeholder="Dell" />
                            </Field>

                            <Field label="Purchase price $ *" error={formErrors.precioCompra}>
                                <input name="precioCompra" type="number" min="0.01" step="0.01" value={form.precioCompra} onChange={handleChange} className="glass-input w-full" placeholder="0.00" />
                            </Field>

                            <Field label="Sale price $ *" error={formErrors.precioVenta}>
                                <input name="precioVenta" type="number" min="0.01" step="0.01" value={form.precioVenta} onChange={handleChange} className="glass-input w-full" placeholder="0.00" />
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

                            <div className="md:col-span-2 flex items-center gap-3 rounded-3xl border border-white/40 bg-white/25 px-4 py-3">
                                <input
                                    type="checkbox"
                                    name="activo"
                                    checked={form.activo}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-white/60 text-[#9a7ef0] focus:ring-[#9a7ef0]"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-[#392750]">Active product</p>
                                    <p className="text-xs text-[#392750]">You can activate or deactivate the product without deleting it.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="inline-flex h-10 items-center justify-center rounded-full border border-white/45 bg-white/45 px-5 text-sm font-semibold products-violet-black-button shadow-sm transition hover:bg-white/55"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold products-violet-black-button shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
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
    rounded,
}: {
    label: string;
    value: string;
    valueClassName?: string;
    rounded?: string;
}) {
    return (
        <div className={`${rounded || "rounded-2xl"} border border-white/40 bg-white/25 px-3 py-2`}>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">{label}</p>
            <p className={`mt-1 text-sm font-semibold text-slate-800 ${valueClassName || ""}`}>{value}</p>
        </div>
    );
}
