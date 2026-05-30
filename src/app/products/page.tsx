"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Loading } from "@/components/ui/Loading";
import { Spinner } from "@/components/ui/Spinner";
import { Portal } from "@/components/ui/Portal";
import { Toast } from "@/components/ui/Toast";
import { productsService } from "@/services/products.service";
import type { Product, ProductFormValues } from "@/types/product";
import { ChevronLeft, ChevronRight, Box, CheckCircle2, Plus, Power, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { canAccessRoute, getDefaultRoute, getRouteByPath } from "@/routes/routeConfig";
import { usePathname, useRouter } from "next/navigation";

type StatusFilter = "all" | "active" | "inactive";

type ProductFormState = {
    // sku: generado automáticamente por el backend
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

const itemsPerPage = 4;

const emptyForm: ProductFormState = {
    // sku: generado automáticamente por el backend
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
        // sku: no editable, viene del registro existente
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
    const [totalActive, setTotalActive] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form, setForm] = useState<ProductFormState>(emptyForm);
    const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [statusToast, setStatusToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [validationToast, setValidationToast] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const requestSeqRef = useRef(0);

    // search and statusFilter already control list queries via buildQuery

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
    
    const fetchProducts = async (opts?: { search?: string; status?: StatusFilter; page?: number }) => {
        const requestSeq = ++requestSeqRef.current;
        const q = opts?.search !== undefined ? opts.search : search;
        const status = opts?.status !== undefined ? opts.status : statusFilter;
        const page = opts?.page !== undefined ? opts.page : currentPage;

        const query: Record<string, string | number | boolean> = {
            page,
            limit: itemsPerPage,
        };

        const trimmedSearch = String(q || "").trim();
        if (trimmedSearch) query.q = trimmedSearch;
        if (status === "active") query.activo = true;
        if (status === "inactive") query.activo = false;

        try {
            setIsLoading(true);
            const data = await productsService.getAll(query);
            if (requestSeq !== requestSeqRef.current) return;
            const items = data.items || [];

            setProducts(items);
            setTotalItems(data.total || 0);
            setTotalPages(Math.max(1, Math.ceil((data.total || 0) / (data.limit || itemsPerPage))));
        } catch (error: any) {
            if (requestSeq !== requestSeqRef.current) return;
            console.error("Error loading products:", error);
            setToast({ message: error?.response?.data?.message || "Error loading products", type: "error" });
        } finally {
            if (requestSeq !== requestSeqRef.current) return;
            setIsLoading(false);
        }
    };

    const fetchActiveCount = async () => {
        try {
            const data = await productsService.getAll({ activo: true, limit: 1 });
            setTotalActive(data.total || 0);
        } catch {}
    };

    useEffect(() => {
        void fetchActiveCount();
    }, []);

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

        // sku: validación eliminada, se genera automáticamente
        const nombre = form.nombre.trim();
        const categoria = form.categoria.trim();

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
            // sku: ya no es campo de entrada
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
            // sku: generado automáticamente por el backend
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
            void fetchActiveCount();
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
            setStatusToast({
                message: product.activo ? "Product deactivated successfully" : "Product activated successfully",
                type: "success",
            });
            await fetchProducts();
            void fetchActiveCount();
        } catch (error: any) {
            console.error(error);
            setStatusToast({ message: error?.response?.data?.message || "Error changing product status", type: "error" });
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
            void fetchActiveCount();
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
                    onClose={() => setToast(null)}
                />
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
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2 rounded-2xl flex items-center justify-center">
                            <Box className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                                Products
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">Catalog ready for inventory and receptions.</p>
                        </div>
                    </div>
                </div>

                {/* Badge + filters */}
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Active products: {totalActive}
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <div className="flex flex-1 items-center gap-2">
                            <input
                                type="text"
                                placeholder="Search by name, sku..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                    void fetchProducts({ search: e.target.value, status: statusFilter, page: 1 });
                                }}
                                className="glass-input"
                            />
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("all");
                                    setCurrentPage(1);
                                    void fetchProducts({ search: "", status: "all", page: 1 });
                                }}
                                className={`${buttonBase} whitespace-nowrap`}
                            >
                                Clear filter
                            </button>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                const v = e.target.value as StatusFilter;
                                setStatusFilter(v);
                                setCurrentPage(1);
                                void fetchProducts({ search, status: v, page: 1 });
                            }}
                            className="glass-input"
                        >
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <button onClick={openCreate} className={`${buttonBase} whitespace-nowrap`}>
                            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                            Create
                        </button>
                    </div>
                </div>
                
                {isLoading ? (
                    <Spinner />
                ) : (
                    <div className="glass-card overflow-hidden rounded-[40px] relative">
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
                <Portal>
                <div className="app-modal-overlay app-modal-overlay--padded app-modal-overlay--form">
                    <div className="app-modal-shell app-modal-shell--xl glass-card relative overflow-y-auto max-h-full scrollbar-none p-6 md:p-8">
                        {validationToast && (
                            <Toast
                                message={validationToast}
                                type="error"
                                duration={1000}
                                onClose={() => setValidationToast(null)}
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
                            <div className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
                                <span>SKU</span>
                                <div className="glass-input w-full bg-white/10 text-slate-500 cursor-not-allowed select-none flex items-center gap-2 min-h-[2.5rem]">
                                    {editingProduct
                                        ? <span className="font-bold text-slate-700">{editingProduct.sku}</span>
                                        : <span className="italic text-slate-400">Auto-generated on save</span>
                                    }
                                </div>
                            </div>

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

                            <Field label="Stock *" error={formErrors.stock}>
                                <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} className="glass-input w-full" placeholder="0" />
                            </Field>

                            <Field label="Minimum stock *" error={formErrors.stockMinimo}>
                                <input name="stockMinimo" type="number" min="0" step="1" value={form.stockMinimo} onChange={handleChange} className="glass-input w-full" placeholder="0" />
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
                </Portal>
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
                cancelButtonClassName=""
                confirmButtonClassName=""
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
