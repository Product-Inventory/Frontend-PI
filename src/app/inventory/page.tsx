"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Loading } from "@/components/ui/Loading";
import { Toast } from "@/components/ui/Toast";
import { inventoryService } from "@/services/inventory.service";
import type { InventoryAdjustmentPayload, InventoryItem, InventoryMovement } from "@/types/inventory";
import { Activity, AlertTriangle, Box, Search } from "lucide-react";

type StatusFilter = "all" | "active" | "inactive";
type LowStockFilter = "all" | "low";
type MovementTypeFilter = "all" | "ENTRADA" | "SALIDA" | "AJUSTE";

// Estado inicial del formulario de ajuste
type AdjustFormState = {
    tipo: "ENTRADA" | "SALIDA" | "AJUSTE";
    cantidad: string;
    motivo: string;
    referencia: string;
};

type AdjustFormErrors = Partial<Record<keyof AdjustFormState, string>>;

// Numeros de filas por tabla para mostrar usando la paginacion
const inventoryItemsPerPage = 3;
const movementItemsPerPage = 3;

const emptyAdjustForm: AdjustFormState = {
    tipo: "ENTRADA",
    cantidad: "",
    motivo: "",
    referencia: "",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
});

// Formatea las fechas de actualización de los productos, mostrando "-" para valores nulos o inválidos
function formatDate(value: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
}

// Considera vacíos como inválidos y luego verifica que el número sea positivo para validar la cantidad en el formulario de ajuste
function isPositiveNumber(value: string) {
    if (value.trim() === "") return false;
    const parsed = Number(value);
    return !Number.isNaN(parsed) && parsed > 0; // Solo números positivos
}

// Normaliza los textos opcionales para que la API reciba null en lugar de vacíos.
function normalizeOptionalText(value: string) {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
}

export default function InventoryPage() {
    // El toast es el canal ligero para mostrar éxitos y errores.
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // La página tiene dos vistas internas: inventario y movimientos.
    const [activeTab, setActiveTab] = useState<"inventory" | "movements">("inventory");

    // Estado y filtros de la lista de inventario.
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [inventoryLoading, setInventoryLoading] = useState(true);
    const [inventorySearch, setInventorySearch] = useState("");
    const [inventoryStatusFilter, setInventoryStatusFilter] = useState<StatusFilter>("all");
    const [inventoryLowStockFilter, setInventoryLowStockFilter] = useState<LowStockFilter>("all");
    const [inventoryPage, setInventoryPage] = useState(1);
    const [inventoryTotalPages, setInventoryTotalPages] = useState(1);
    const [inventoryTotalItems, setInventoryTotalItems] = useState(0);

    // Estado y filtros de la lista de movimientos.
    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [movementsLoading, setMovementsLoading] = useState(false);
    const [movementsSearch, setMovementsSearch] = useState("");
    const [movementsTypeFilter, setMovementsTypeFilter] = useState<MovementTypeFilter>("all");
    const [movementsProductId, setMovementsProductId] = useState("");
    const [movementsPage, setMovementsPage] = useState(1);
    const [movementsTotalPages, setMovementsTotalPages] = useState(1);
    const [movementsTotalItems, setMovementsTotalItems] = useState(0);

    // Estado del modal para ajustes realizados desde la lista de inventario.
    const [adjustOpen, setAdjustOpen] = useState(false);
    const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
    const [adjustForm, setAdjustForm] = useState<AdjustFormState>(emptyAdjustForm);
    const [adjustErrors, setAdjustErrors] = useState<AdjustFormErrors>({});
    const [adjustLoading, setAdjustLoading] = useState(false);
    const [adjustSaving, setAdjustSaving] = useState(false);

    // Métrica derivada usada en el indicador del encabezado de inventario.
    const lowStockCount = useMemo(
        () => inventoryItems.filter((item) => item.lowStock || Number(item.stock) <= Number(item.stockMinimo)).length,
        [inventoryItems]
    );

    // La paginación solo se muestra si el total de registros lo justifica.
    const showInventoryPagination = inventoryTotalItems > inventoryItemsPerPage;
    const showMovementsPagination = movementsTotalItems > movementItemsPerPage;

    // Construye la consulta de inventario a partir de los filtros actuales.
    const buildInventoryQuery = () => {
        const query: Record<string, string | number | boolean> = {
            page: inventoryPage,
            limit: inventoryItemsPerPage,
        };

        const trimmedSearch = inventorySearch.trim();
        if (trimmedSearch) query.q = trimmedSearch;
        if (inventoryStatusFilter === "active") query.activo = true;
        if (inventoryStatusFilter === "inactive") query.activo = false;
        if (inventoryLowStockFilter === "low") query.lowStock = true;

        return query;
    };

    // Construye la consulta de movimientos con búsqueda, filtros y producto seleccionado.
    const buildMovementsQuery = () => {
        const query: Record<string, string | number> = {
            page: movementsPage,
            limit: movementItemsPerPage,
        };

        const trimmedSearch = movementsSearch.trim();
        if (trimmedSearch) query.q = trimmedSearch;
        if (movementsTypeFilter !== "all") query.tipo = movementsTypeFilter;
        const trimmedProductId = movementsProductId.trim();
        if (trimmedProductId) query.productId = trimmedProductId;

        return query;
    };

    // Carga la tabla de inventario usando el estado actual de filtros.
    const fetchInventory = async () => {
        try {
            setInventoryLoading(true);
            const data = await inventoryService.getAll(buildInventoryQuery());
            const items = data.items || [];

            setInventoryItems(items);
            setInventoryTotalItems(data.total || 0);
            setInventoryTotalPages(Math.max(1, Math.ceil((data.total || 0) / (data.limit || inventoryItemsPerPage))));
        } catch (error: any) {
            console.error("Error loading inventory:", error);
            setToast({ message: error?.response?.data?.message || "Error loading inventory", type: "error" });
        } finally {
            setInventoryLoading(false);
        }
    };

    // Carga la tabla de movimientos usando los filtros actuales.
    const fetchMovements = async () => {
        try {
            setMovementsLoading(true);
            const data = await inventoryService.getMovements(buildMovementsQuery());
            const items = data.items || [];

            setMovements(items);
            setMovementsTotalItems(data.total || 0);
            setMovementsTotalPages(Math.max(1, Math.ceil((data.total || 0) / (data.limit || movementItemsPerPage))));
        } catch (error: any) {
            console.error("Error loading movements:", error);
            setToast({ message: error?.response?.data?.message || "Error loading movements", type: "error" });
        } finally {
            setMovementsLoading(false);
        }
    };

    // Vuelve a cargar inventario cuando cambian filtros o página.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchInventory();
        }, 250);

        return () => window.clearTimeout(timer);
    }, [inventorySearch, inventoryStatusFilter, inventoryLowStockFilter, inventoryPage]);

    // Reinicia la paginación de inventario cuando cambian los filtros.
    useEffect(() => {
        setInventoryPage(1);
    }, [inventorySearch, inventoryStatusFilter, inventoryLowStockFilter]);

    // Ajusta la página de inventario al último valor válido después de actualizar totales.
    useEffect(() => {
        setInventoryPage((page) => Math.min(page, inventoryTotalPages));
    }, [inventoryTotalPages]);

    // Vuelve a cargar movimientos cuando cambian filtros o página.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchMovements();
        }, 250);

        return () => window.clearTimeout(timer);
    }, [movementsSearch, movementsTypeFilter, movementsProductId, movementsPage]);

    // Reinicia la paginación de movimientos cuando cambian los filtros.
    useEffect(() => {
        setMovementsPage(1);
    }, [movementsSearch, movementsTypeFilter, movementsProductId]);

    // Limita la página de movimientos para no pedir una página fuera de rango.
    useEffect(() => {
        setMovementsPage((page) => Math.min(page, movementsTotalPages));
    }, [movementsTotalPages]);

    // Abre el modal de ajuste y trae la información más reciente del producto.
    const openAdjust = async (item: InventoryItem) => {
        setAdjustOpen(true);
        setAdjustItem(item);
        setAdjustForm(emptyAdjustForm);
        setAdjustErrors({});

        const productId = item.productId || item.id;
        if (!productId) return;

        try {
            // Aunque ya tenemos datos del producto, los volvemos a traer para asegurarnos de tener la información más actualizada antes de hacer un ajuste
            setAdjustLoading(true);
            const data = await inventoryService.getByProductId(productId);
            setAdjustItem(data.item);
        } catch (error: any) {
            console.error("Error loading inventory item:", error);
            setToast({ message: error?.response?.data?.message || "Error loading inventory item", type: "error" });
        } finally {
            setAdjustLoading(false);
        }
    };

    // Cierra el modal y limpia el estado temporal del formulario
    const closeAdjust = () => {
        setAdjustOpen(false);
        setAdjustItem(null);
        setAdjustForm(emptyAdjustForm);
        setAdjustErrors({});
    };

    // Manejador genérico para los campos del modal de ajuste
    const handleAdjustChange = (event: any) => {
        const { name, value } = event.target;
        setAdjustForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    // Valida el modal antes de enviar la solicitud de ajuste
    const validateAdjustForm = () => {
        const nextErrors: AdjustFormErrors = {};
        if (!adjustForm.tipo) nextErrors.tipo = "Select a movement type";
        if (!isPositiveNumber(adjustForm.cantidad)) nextErrors.cantidad = "Enter a positive quantity";
        if (!adjustForm.motivo.trim()) nextErrors.motivo = "Reason is required";
        return nextErrors;
    };

    // Guarda el ajuste de inventario y actualiza ambas tablas
    const handleAdjustSubmit = async () => {
        if (!adjustItem) return;

        const nextErrors = validateAdjustForm();
        setAdjustErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            setToast({ message: "Review the highlighted fields before saving", type: "error" });
            return;
        }

        const productId = adjustItem.productId || adjustItem.id;
        const payload: InventoryAdjustmentPayload = {
            tipo: adjustForm.tipo,
            cantidad: Number(adjustForm.cantidad),
            motivo: adjustForm.motivo.trim(),
            referencia: normalizeOptionalText(adjustForm.referencia),
        };

        try {
            setAdjustSaving(true);
            await inventoryService.adjust(productId, payload);
            setToast({ message: "Inventory adjusted successfully", type: "success" });
            closeAdjust();
            await fetchInventory();
            await fetchMovements();
        } catch (error: any) {
            console.error("Error adjusting inventory:", error);
            setToast({ message: error?.response?.data?.message || "Error adjusting inventory", type: "error" });
        } finally {
            setAdjustSaving(false);
        }
    };

    // Cambia a movimientos y prefiltra por el producto seleccionado
    const handleViewMovements = (item: InventoryItem) => {
        setMovementsSearch("");
        setMovementsTypeFilter("all");
        setMovementsProductId(item.productId || item.id);
        setMovementsPage(1);
        setActiveTab("movements");
    };

    const buttonBase =
        "inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-xs sm:text-sm font-semibold text-[#9a7ef0]! shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";

    return (
        <div className="flex flex-col h-full overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
                {/* Toast global para operaciones asíncronas. */}
                {toast && (
                    <Toast message={toast.message} type={toast.type} duration={3000} onClose={() => setToast(null)} />
                )}

                {/* Encabezado de la página con título y pestañas. */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                        <div className="bg-white/10 p-2 rounded-md flex items-center justify-center">
                            <Box className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                                Inventory
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-slate-600">
                                Track stock levels, low stock signals, and movements.
                            </p>
                        </div>
                    </div>

                    {/* Botones de pestañas */}
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                        <button
                            onClick={() => setActiveTab("inventory")}
                            className={`inline-flex h-10 items-center justify-center rounded-full border px-5 text-sm font-semibold shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 ${activeTab === "inventory"
                                ? "border-indigo-400/60 bg-indigo-100/60 text-indigo-700"
                                : "border-white/50 bg-white/35 text-[#9a7ef0]!"
                                }`}
                        >
                            Inventory
                        </button>
                        <button
                            onClick={() => setActiveTab("movements")}
                            className={`inline-flex h-10 items-center justify-center rounded-full border px-5 text-sm font-semibold shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 ${activeTab === "movements"
                                ? "border-indigo-400/60 bg-indigo-100/60 text-indigo-700"
                                : "border-white/50 bg-white/35 text-[#9a7ef0]!"
                                }`}
                        >
                            Movements
                        </button>
                    </div>
                </div>

                {/* Barra de filtros compartida: se adapta según la pestaña activa. */}
                <div className="flex flex-col gap-3">
                    {/* Primera fila: búsqueda más los dos filtros específicos. */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_0.6fr_0.6fr]">
                        <div className="relative sm:col-span-2 lg:col-span-1">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                <Search className="h-4 w-4" />
                            </span>
                            {activeTab === "inventory" ? (
                                <input
                                    type="text"
                                    value={inventorySearch}
                                    onChange={(event) => setInventorySearch(event.target.value)}
                                    placeholder="Search by SKU, name, or category..."
                                    className="w-full rounded-full border border-white/45 bg-white/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-[0_6px_18px_rgba(138,108,198,0.12)] outline-none backdrop-blur-md placeholder:text-slate-400 focus:border-white/70"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={movementsSearch}
                                    onChange={(event) => setMovementsSearch(event.target.value)}
                                    placeholder="Search movements..."
                                    className="w-full rounded-full border border-white/45 bg-white/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-[0_6px_18px_rgba(138,108,198,0.12)] outline-none backdrop-blur-md placeholder:text-slate-400 focus:border-white/70"
                                />
                            )}
                        </div>

                        {activeTab === "inventory" ? (
                            <select
                                value={inventoryStatusFilter}
                                onChange={(event) => setInventoryStatusFilter(event.target.value as StatusFilter)}
                                className="w-full rounded-full border border-white/45 bg-white/50 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_6px_18px_rgba(138,108,198,0.12)] outline-none backdrop-blur-md focus:border-white/70"
                            >
                                <option value="all">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        ) : (
                            <select
                                value={movementsTypeFilter}
                                onChange={(event) => setMovementsTypeFilter(event.target.value as MovementTypeFilter)}
                                className="w-full rounded-full border border-white/45 bg-white/50 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_6px_18px_rgba(138,108,198,0.12)] outline-none backdrop-blur-md focus:border-white/70"
                            >
                                <option value="all">All types</option>
                                <option value="ENTRADA">Receipts</option>
                                <option value="SALIDA">Issues</option>
                                <option value="AJUSTE">Adjustments</option>
                            </select>
                        )}

                        {activeTab === "inventory" ? (
                            <select
                                value={inventoryLowStockFilter}
                                onChange={(event) => setInventoryLowStockFilter(event.target.value as LowStockFilter)}
                                className="w-full rounded-full border border-white/45 bg-white/50 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_6px_18px_rgba(138,108,198,0.12)] outline-none backdrop-blur-md focus:border-white/70"
                            >
                                <option value="all">All stock levels</option>
                                <option value="low">Low stock only</option>
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={movementsProductId}
                                onChange={(event) => setMovementsProductId(event.target.value)}
                                placeholder="Filter by product id"
                                className="w-full rounded-full border border-white/45 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-800 shadow-[0_6px_18px_rgba(138,108,198,0.12)] outline-none backdrop-blur-md placeholder:text-slate-400 focus:border-white/70"
                            />
                        )}
                    </div>

                    {/* Segunda fila: resumen o controles del producto seleccionado. */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {activeTab === "inventory" ? (
                            <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                Low stock visible: {lowStockCount}
                            </span>
                        ) : (
                            <>
                                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    <Activity className="h-4 w-4 text-indigo-400" />
                                    Movements total: {movementsTotalItems}
                                </span>
                                <button onClick={() => setMovementsProductId("")} className={buttonBase}>
                                    Clear filter
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Contenido de la pestaña de inventario. */}
                {activeTab === "inventory" && (inventoryLoading ? (
                    <Loading label="Loading inventory..." />
                ) : (
                    <div className="glass-card overflow-hidden rounded-[30px]">
                        {/* Tarjetas de inventario para dispositivos pequeños */}
                        <div className="md:hidden space-y-4">
                            {inventoryItems.map((item) => {
                                const lowStock =
                                    item.lowStock ||
                                    Number(item.stock) <= Number(item.stockMinimo);

                                return (
                                    <div
                                        key={item.id}
                                        className={`rounded-3xl border border-white/30 bg-white/25 p-4 backdrop-blur-md ${lowStock ? "bg-amber-50/75" : ""
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-extrabold text-slate-900">
                                                    {item.nombre}
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    {item.sku}
                                                </p>
                                            </div>

                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${item.activo
                                                    ? "bg-emerald-200 text-emerald-700"
                                                    : "bg-slate-200 text-slate-600"
                                                    }`}
                                            >
                                                {item.activo ? "Active" : "Inactive"}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <MobileMeta
                                                label="Stock"
                                                value={String(item.stock)}
                                            />

                                            <MobileMeta
                                                label="Minimum"
                                                value={String(item.stockMinimo)}
                                            />

                                            <MobileMeta
                                                label="Category"
                                                value={item.categoria || "-"}
                                            />

                                            <MobileMeta
                                                label="Updated"
                                                value={formatDate(item.updatedAt)}
                                            />
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            <button
                                                className={buttonBase}
                                                onClick={() => void openAdjust(item)}
                                            >
                                                Adjust
                                            </button>

                                            <button
                                                className={buttonBase}
                                                onClick={() => handleViewMovements(item)}
                                            >
                                                Movements
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tabla de inventario para compus */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-white/25">
                                    <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                                        <th className="px-5 py-4">SKU</th>
                                        <th className="px-5 py-4">Name</th>
                                        <th className="px-5 py-4">Category</th>
                                        <th className="px-5 py-4">Stock</th>
                                        <th className="px-5 py-4">Minimum</th>
                                        <th className="px-5 py-4 text-center">Status</th>
                                        <th className="px-5 py-4">Updated</th>
                                        <th className="px-5 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {inventoryItems.length > 0 ? (
                                        inventoryItems.map((item) => {
                                            const lowStock = item.lowStock || Number(item.stock) <= Number(item.stockMinimo);

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className={`border-t border-white/18 transition ${lowStock ? "bg-amber-50/75" : "hover:bg-white/10"}`}
                                                >
                                                    <td className="px-5 py-5 font-extrabold text-slate-800">{item.sku}</td>
                                                    <td className="px-5 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-semibold text-slate-800">{item.nombre}</span>
                                                            {lowStock && (
                                                                <span className="inline-flex w-fit items-center rounded-full border border-rose-300 bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold tracking-[0.22em] text-rose-500">
                                                                    LOW
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-5 text-slate-700">{item.categoria || "-"}</td>
                                                    <td className="px-5 py-5">
                                                        <span className={`font-extrabold ${lowStock ? "text-rose-600" : "text-slate-800"}`}>
                                                            {item.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-5 font-semibold text-slate-800">{item.stockMinimo}</td>
                                                    <td className="px-5 py-5 text-center">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${item.activo ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"
                                                                }`}
                                                        >
                                                            {item.activo ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-5 text-slate-700">{formatDate(item.updatedAt)}</td>
                                                    <td className="px-5 py-5 text-center">
                                                        <div className="inline-flex items-center gap-2">
                                                            <button className={buttonBase} onClick={() => void openAdjust(item)}>
                                                                Adjust
                                                            </button>
                                                            <button className={buttonBase} onClick={() => handleViewMovements(item)}>
                                                                Movements
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-5 py-14 text-center text-slate-500">
                                                No inventory registered
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pie de paginación del inventario. */}
                        <div className="mt-4 flex flex-col gap-3 border-t border-white/20 px-5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-400">
                            Page {inventoryPage} of {inventoryTotalPages}
                        </p>

                            <div className="grid grid-cols-2 gap-2 p-3 sm:flex">
                                <button
                                    onClick={() => setInventoryPage((page) => Math.max(page - 1, 1))}
                                    disabled={!showInventoryPagination || inventoryPage === 1}
                                        className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm text-[#9a7ef0]! disabled:opacity-20"
                                >
                                    Previous
                                </button>

                                <button
                                    onClick={() => setInventoryPage((page) => Math.min(page + 1, inventoryTotalPages))}
                                    disabled={!showInventoryPagination || inventoryPage === inventoryTotalPages}
                                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm text-[#9a7ef0]! disabled:opacity-20"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Contenido de la pestaña de movimientos. */}
                {activeTab === "movements" && (<>
                    {movementsLoading ? (
                        <Loading label="Loading movements..." />
                    ) : (
                        <div className="glass-card overflow-hidden rounded-[30px]">
                            {/* En dispositivos pequeños se muestran tarjetas para facilitar la lectura. */}
                            <div className="md:hidden space-y-4">
                                {movements.length > 0 ? (
                                    movements.map((movement) => (
                                        <div key={movement.id} className="rounded-3xl border border-white/30 bg-white/25 p-4 backdrop-blur-md">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-extrabold text-slate-900">{movement.productNombre}</p>
                                                    <p className="text-xs text-slate-500">SKU: {movement.sku}</p>
                                                </div>

                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${movement.tipo === "ENTRADA"
                                                        ? "bg-emerald-200 text-emerald-700"
                                                        : movement.tipo === "SALIDA"
                                                            ? "bg-rose-200 text-rose-700"
                                                            : "bg-amber-200 text-amber-700"
                                                        }`}
                                                >
                                                    { // Para que esten en ingles
                                                        movement.tipo === "ENTRADA"
                                                            ? "RECEIPT"
                                                            : movement.tipo === "SALIDA"
                                                                ? "ISSUE"
                                                                : "ADJUSTMENT"
                                                    }
                                                </span>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <MobileMeta label="Qty" value={String(movement.cantidad)} />
                                                <MobileMeta label="Prev" value={String(movement.stockAnterior)} />
                                                <MobileMeta label="New" value={String(movement.stockNuevo)} />
                                                <MobileMeta label="Date" value={formatDate(movement.createdAt)} />
                                            </div>

                                            <div className="mt-4 grid gap-3">
                                                <div className="rounded-2xl border border-white/40 bg-white/25 px-3 py-2">
                                                    <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Reason</p>
                                                    <p className="mt-1 text-sm font-semibold text-slate-800">{movement.motivo || "-"}</p>
                                                </div>

                                                <div className="rounded-2xl border border-white/40 bg-white/25 px-3 py-2">
                                                    <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">User</p>
                                                    <p className="mt-1 text-sm font-semibold text-slate-800">{movement.usuario || "-"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-3xl border border-white/30 bg-white/25 p-6 text-center text-slate-500 backdrop-blur-md">
                                        No movements registered
                                    </div>
                                )}
                            </div>

                            {/* En escritorio se muestra una tabla con el historial completo de movimientos. */}
                            {/* Tabla de movimientos para escritorio. */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-white/25">
                                        {/* Encabezados de cada columna del listado de movimientos. */}
                                        <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                                            <th className="px-5 py-4">SKU</th>
                                            <th className="px-5 py-4">Product</th>
                                            <th className="px-5 py-4">Type</th>
                                            <th className="px-5 py-4">Qty</th>
                                            <th className="px-5 py-4">Prev</th>
                                            <th className="px-5 py-4">New</th>
                                            <th className="px-5 py-4">Reason</th>
                                            <th className="px-5 py-4">User</th>
                                            <th className="px-5 py-4">Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {/* Si hay datos, se pinta una fila por cada movimiento registrado. */}
                                        {movements.length > 0 ? (
                                            movements.map((movement) => (
                                                <tr key={movement.id} className="border-t border-white/18 transition hover:bg-white/10">
                                                    {/* SKU y nombre del producto afectado por el movimiento. */}
                                                    <td className="px-5 py-5 font-extrabold text-slate-800">{movement.sku}</td>
                                                    <td className="px-5 py-5 text-slate-700">{movement.productNombre}</td>
                                                    {/* El tipo se resalta con un color distinto para lectura rápida. */}
                                                    <td className="px-5 py-5">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${movement.tipo === "ENTRADA"
                                                                ? "bg-emerald-200/80 text-emerald-700"
                                                                : movement.tipo === "SALIDA"
                                                                    ? "bg-rose-200/80 text-rose-700"
                                                                    : "bg-amber-200/80 text-amber-700"
                                                                }`}
                                                        >
                                                            { // Para que esten en ingles
                                                                movement.tipo === "ENTRADA"
                                                                    ? "RECEIPT"
                                                                    : movement.tipo === "SALIDA"
                                                                        ? "ISSUE"
                                                                        : "ADJUSTMENT"
                                                            }
                                                        </span>
                                                    </td>
                                                    {/* Cantidad y stock anterior/nuevo para entender el cambio exacto. */}
                                                    <td className="px-5 py-5 font-semibold text-slate-800">{movement.cantidad}</td>
                                                    <td className="px-5 py-5 text-slate-700">{movement.stockAnterior}</td>
                                                    <td className="px-5 py-5 text-slate-700">{movement.stockNuevo}</td>
                                                    {/* Motivo, usuario y fecha ayudan a auditar quién hizo el cambio y por qué. */}
                                                    <td className="px-5 py-5 text-slate-700">{movement.motivo || "-"}</td>
                                                    <td className="px-5 py-5 text-slate-700">{movement.usuario || "-"}</td>
                                                    <td className="px-5 py-5 text-slate-700">{formatDate(movement.createdAt)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                {/* Estado vacío cuando todavía no hay movimientos para mostrar. */}
                                                <td colSpan={9} className="px-5 py-14 text-center text-slate-500">
                                                    No movements registered
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pie de paginación de movimientos. */}
                            <div className="flex justify-between items-center mt-4 border-t border-white/20 px-5 pt-4">
                                <p className="text-sm text-gray-400">
                                    Page {movementsPage} of {movementsTotalPages}
                                </p>

                                <div className="grid grid-cols-2 gap-2 p-3 sm:flex">
                                    <button
                                        onClick={() => setMovementsPage((page) => Math.max(page - 1, 1))}
                                        disabled={!showMovementsPagination || movementsPage === 1}
                                        className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm text-[#9a7ef0]! disabled:opacity-20"
                                    >
                                        Previous
                                    </button>

                                    <button
                                        onClick={() => setMovementsPage((page) => Math.min(page + 1, movementsTotalPages))}
                                        disabled={!showMovementsPagination || movementsPage === movementsTotalPages}
                                        className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm text-[#9a7ef0]! disabled:opacity-20"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>)}
            </div>

            {/* Modal para crear un movimiento de stock mediante ajuste. */}
            {adjustOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 py-4">
                    <div className="glass-card w-full max-w-3xl rounded-t-[28px] sm:rounded-[28px] p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Adjust inventory</h2>
                                <p className="mt-1 text-sm text-slate-600">Register an entry, exit, or adjustment movement.</p>
                            </div>

                            <button
                                onClick={closeAdjust}
                                className="inline-flex h-10 items-center justify-center rounded-full border border-white/45 bg-white/45 px-4 text-sm font-semibold text-[#9a7ef0]! shadow-sm transition hover:bg-white/55"
                            >
                                Close
                            </button>
                        </div>

                        {/* Mientras se carga el detalle del producto se muestra un loader simple. */}
                        {adjustLoading ? (
                            <Loading label="Loading inventory detail..." />
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Formulario del ajuste: muestra el producto y captura el nuevo movimiento. */}
                                {/* Nombre y SKU del producto como referencia visual para el usuario. */}
                                <Field label="Product">
                                    <input
                                        value={`${adjustItem?.sku || ""} ${adjustItem?.nombre || ""}`.trim()}
                                        readOnly
                                        className="glass-input w-full"
                                    />
                                </Field>

                                {/* Stock actual antes de aplicar el ajuste. */}
                                <Field label="Current stock">
                                    <input value={adjustItem?.stock ?? "-"} readOnly className="glass-input w-full" />
                                </Field>

                                {/* Tipo de movimiento que se va a registrar. */}
                                <Field label="Movement type" error={adjustErrors.tipo}>
                                    <select
                                        name="tipo"
                                        value={adjustForm.tipo}
                                        onChange={handleAdjustChange}
                                        className="glass-input w-full"
                                    >
                                        <option value="ENTRADA">Receipts</option>
                                        <option value="SALIDA">Issues</option>
                                        <option value="AJUSTE">Adjustments</option>
                                    </select>
                                </Field>

                                {/* Cantidad a sumar o restar del inventario. */}
                                <Field label="Quantity" error={adjustErrors.cantidad}>
                                    <input
                                        name="cantidad"
                                        type="number"
                                        min="1"
                                        value={adjustForm.cantidad}
                                        onChange={handleAdjustChange}
                                        className="glass-input w-full"
                                    />
                                </Field>

                                {/* Motivo requerido para dejar trazabilidad del ajuste. */}
                                <Field label="Reason" error={adjustErrors.motivo}>
                                    <input
                                        name="motivo"
                                        value={adjustForm.motivo}
                                        onChange={handleAdjustChange}
                                        className="glass-input w-full"
                                        placeholder="Damage, recount, supplier return..."
                                    />
                                </Field>

                                {/* Referencia opcional para documentos, tickets o notas internas. */}
                                <Field label="Reference">
                                    <input
                                        name="referencia"
                                        value={adjustForm.referencia}
                                        onChange={handleAdjustChange}
                                        className="glass-input w-full"
                                        placeholder="Optional document, note..."
                                    />
                                </Field>
                            </div>
                        )}

                        {/* Botones para cancelar o guardar el ajuste registrado. */}
                        <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
                            <button
                                onClick={closeAdjust}
                                className="inline-flex h-10 items-center justify-center rounded-full border border-white/45 bg-white/45 px-5 text-sm font-semibold text-[#9a7ef0]! shadow-sm transition hover:bg-white/55"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => void handleAdjustSubmit()}
                                disabled={adjustSaving || adjustLoading}
                                className="inline-flex h-10 items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold text-[#9a7ef0]! shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {adjustSaving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Contenedor pequeño que agrupa etiqueta, campo y mensaje de validación.
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
            <span>{label}</span>
            {children}
            {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
        </label>
    );
}

// Bloque compacto de valores usado en el diseño móvil de inventario.
function MobileMeta({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
    return (
        <div className="rounded-2xl border border-white/40 bg-white/25 px-3 py-2">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">{label}</p>
            <p className={`mt-1 text-sm font-semibold text-slate-800 ${valueClassName || ""}`}>{value}</p>
        </div>
    );
}