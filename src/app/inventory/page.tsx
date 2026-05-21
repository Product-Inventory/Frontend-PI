"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Loading } from "@/components/ui/Loading";
import { Toast } from "@/components/ui/Toast";
import { inventoryService } from "@/services/inventory.service";
import type { InventoryAdjustmentPayload, InventoryItem, InventoryMovement } from "@/types/inventory";
import { Activity, AlertTriangle, Box } from "lucide-react";

// ── Tipos de filtro ────────────────────────────────────────────────────────────

type StatusFilter       = "all" | "active" | "inactive";
type LowStockFilter     = "all" | "low";
type MovementTypeFilter = "all" | "ENTRADA" | "SALIDA" | "AJUSTE";

// Estructura del formulario de ajuste de inventario
type AdjustFormState = {
    tipo:      "ENTRADA" | "SALIDA" | "AJUSTE";
    cantidad:  string;
    motivo:    string;
    referencia: string;
};

// Errores de validación del formulario (cada campo es opcional)
type AdjustFormErrors = Partial<Record<keyof AdjustFormState, string>>;

// ── Constantes ────────────────────────────────────────────────────────────────

// Cuántos registros mostrar por página en cada tabla
const inventoryItemsPerPage = 3;
const movementItemsPerPage  = 3;

// Estado vacío que se usa al abrir o resetear el modal de ajuste
const emptyAdjustForm: AdjustFormState = {
    tipo:       "ENTRADA",
    cantidad:   "",
    motivo:     "",
    referencia: "",
};

// Formateador de fechas reutilizable para toda la página
const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
});

// ── Funciones utilitarias ─────────────────────────────────────────────────────

// Devuelve la fecha formateada o "-" para valores nulos o inválidos
function formatDate(value: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
}

// Verifica que el valor sea un número positivo (rechaza vacíos y negativos)
function isPositiveNumber(value: string) {
    if (value.trim() === "") return false;
    const parsed = Number(value);
    return !Number.isNaN(parsed) && parsed > 0;
}

// Convierte strings vacíos en null para que la API no reciba campos vacíos
function normalizeOptionalText(value: string) {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function InventoryPage() {

    // ── Estado global de UI ──────────────────────────────────────────────────

    // Canal ligero para mostrar éxitos y errores al usuario
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Controla qué pestaña está activa: inventario o movimientos
    const [activeTab, setActiveTab] = useState<"inventory" | "movements">("inventory");

    // ── Estado de inventario ─────────────────────────────────────────────────

    const [inventoryItems,       setInventoryItems]       = useState<InventoryItem[]>([]);
    const [inventoryLoading,     setInventoryLoading]     = useState(true);
    const [inventorySearch,      setInventorySearch]      = useState("");
    const [inventoryStatusFilter, setInventoryStatusFilter] = useState<StatusFilter>("all");
    const [inventoryLowStockFilter, setInventoryLowStockFilter] = useState<LowStockFilter>("all");
    const [inventoryPage,        setInventoryPage]        = useState(1);
    const [inventoryTotalPages,  setInventoryTotalPages]  = useState(1);
    const [inventoryTotalItems,  setInventoryTotalItems]  = useState(0);

    // ── Estado de movimientos ────────────────────────────────────────────────

    const [movements,            setMovements]            = useState<InventoryMovement[]>([]);
    const [movementsLoading,     setMovementsLoading]     = useState(false);
    const [movementsSearch,      setMovementsSearch]      = useState("");
    const [movementsTypeFilter,  setMovementsTypeFilter]  = useState<MovementTypeFilter>("all");
    const [movementsProductId,   setMovementsProductId]   = useState("");
    const [movementsProductName, setMovementsProductName] = useState("");
    const [movementsPage,        setMovementsPage]        = useState(1);
    const [movementsTotalPages,  setMovementsTotalPages]  = useState(1);
    const [movementsTotalItems,  setMovementsTotalItems]  = useState(0);

    // ── Estado del modal de ajuste ───────────────────────────────────────────

    const [adjustOpen,    setAdjustOpen]    = useState(false);
    const [adjustItem,    setAdjustItem]    = useState<InventoryItem | null>(null);
    const [adjustForm,    setAdjustForm]    = useState<AdjustFormState>(emptyAdjustForm);
    const [adjustErrors,  setAdjustErrors]  = useState<AdjustFormErrors>({});
    const [adjustLoading, setAdjustLoading] = useState(false);
    const [adjustSaving,  setAdjustSaving]  = useState(false);

    // ── Valores derivados ────────────────────────────────────────────────────

    // Cuenta cuántos productos visibles están por debajo del stock mínimo
    const lowStockCount = useMemo(
        () => inventoryItems.filter(
            (item) => item.lowStock || Number(item.stock) <= Number(item.stockMinimo)
        ).length,
        [inventoryItems]
    );

    // La paginación solo aparece si hay más registros de los que caben en una página
    const showInventoryPagination = inventoryTotalItems > inventoryItemsPerPage;
    const showMovementsPagination = movementsTotalItems > movementItemsPerPage;

    // ── Constructores de consulta ────────────────────────────────────────────

    // Arma los parámetros de búsqueda de inventario según los filtros activos
    const buildInventoryQuery = () => {
        const query: Record<string, string | number | boolean> = {
            page:  inventoryPage,
            limit: inventoryItemsPerPage,
        };

        const trimmedSearch = inventorySearch.trim();
        if (trimmedSearch)                          query.q       = trimmedSearch;
        if (inventoryStatusFilter === "active")     query.activo  = true;
        if (inventoryStatusFilter === "inactive")   query.activo  = false;
        if (inventoryLowStockFilter === "low")      query.lowStock = true;

        return query;
    };

    // Arma los parámetros de búsqueda de movimientos según los filtros activos
    const buildMovementsQuery = () => {
        const query: Record<string, string | number> = {
            page:  movementsPage,
            limit: movementItemsPerPage,
        };

        const trimmedSearch    = movementsSearch.trim();
        const trimmedProductId = movementsProductId.trim();

        // Solo se incluye el filtro de texto si no está vacío para evitar interferir con la búsqueda por producto
        if (trimmedSearch)                    query.q         = trimmedSearch;
        if (movementsTypeFilter !== "all")    query.tipo      = movementsTypeFilter;
        if (trimmedProductId)                 query.productId = trimmedProductId;

        return query;
    };

    // ── Funciones de carga de datos ──────────────────────────────────────────

    // Obtiene la lista de inventario con los filtros y página actuales
    const fetchInventory = async () => {
        try {
            // Para que se vea el indicar de carga
            setInventoryLoading(true);
            const data  = await inventoryService.getAll(buildInventoryQuery());
            const items = data.items || [];

            setInventoryItems(items);
            setInventoryTotalItems(data.total || 0);
            setInventoryTotalPages(
                Math.max(1, Math.ceil((data.total || 0) / (data.limit || inventoryItemsPerPage)))
            );
        } catch (error: any) {
            console.error("Error loading inventory:", error);
            setToast({ message: error?.response?.data?.message || "Error loading inventory", type: "error" });
        } finally {
            setInventoryLoading(false);
        }
    };

    // Obtiene el historial de movimientos con los filtros y página actuales
    const fetchMovements = async () => {
        try {
            // Para que se vea el indicador de carga
            setMovementsLoading(true);
            const data  = await inventoryService.getMovements(buildMovementsQuery());
            const items = data.items || [];

            setMovements(items);
            setMovementsTotalItems(data.total || 0);
            setMovementsTotalPages(
                Math.max(1, Math.ceil((data.total || 0) / (data.limit || movementItemsPerPage)))
            );
        } catch (error: any) {
            console.error("Error loading movements:", error);
            setToast({ message: error?.response?.data?.message || "Error loading movements", type: "error" });
        } finally {
            setMovementsLoading(false);
        }
    };

    // ── Efectos de inventario ────────────────────────────────────────────────

    // Recarga el inventario cada vez que cambia un filtro o la página (con debounce de 250ms)
    useEffect(() => {
        const timer = window.setTimeout(() => { void fetchInventory(); }, 250);
        return () => window.clearTimeout(timer);
    }, [inventorySearch, inventoryStatusFilter, inventoryLowStockFilter, inventoryPage]);

    // Vuelve a la primera página cuando cambia cualquier filtro de inventario
    useEffect(() => {
        setInventoryPage(1);
    }, [inventorySearch, inventoryStatusFilter, inventoryLowStockFilter]);

    // Ajusta la página actual si el total de páginas disminuye (ej. después de filtrar)
    useEffect(() => {
        setInventoryPage((page) => Math.min(page, inventoryTotalPages));
    }, [inventoryTotalPages]);

    // ── Efectos de movimientos ───────────────────────────────────────────────

    // Recarga movimientos cuando cambia un filtro o la página (con debounce de 250ms)
    useEffect(() => {
        const timer = window.setTimeout(() => { void fetchMovements(); }, 250);
        return () => window.clearTimeout(timer);
    }, [movementsSearch, movementsTypeFilter, movementsProductId, movementsPage]);

    // Vuelve a la primera página cuando cambia cualquier filtro de movimientos
    useEffect(() => {
        setMovementsPage(1);
    }, [movementsSearch, movementsTypeFilter, movementsProductId]);

    // Ajusta la página actual si el total de páginas de movimientos disminuye
    useEffect(() => {
        setMovementsPage((page) => Math.min(page, movementsTotalPages));
    }, [movementsTotalPages]);

    // ── Manejadores del modal de ajuste ──────────────────────────────────────

    // Abre el modal y recarga el detalle actualizado del producto antes de ajustar
    const openAdjust = async (item: InventoryItem) => {
        setAdjustOpen(true);
        setAdjustItem(item);
        setAdjustForm(emptyAdjustForm);
        setAdjustErrors({});

        const productId = item.productId || item.id;
        if (!productId) return;

        try {
            // Se vuelve a traer el producto para tener el stock más reciente antes de ajustar
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

    // Cierra el modal y limpia todo el estado temporal del formulario
    const closeAdjust = () => {
        setAdjustOpen(false);
        setAdjustItem(null);
        setAdjustForm(emptyAdjustForm);
        setAdjustErrors({});
    };

    // Actualiza un campo del formulario de ajuste al escribir
    const handleAdjustChange = (event: any) => {
        const { name, value } = event.target;
        setAdjustForm((current) => ({ ...current, [name]: value }));
    };

    // Valida todos los campos antes de enviar el ajuste
    const validateAdjustForm = () => {
        const nextErrors: AdjustFormErrors = {};
        if (!adjustForm.tipo)                      nextErrors.tipo     = "Select a movement type";
        if (!isPositiveNumber(adjustForm.cantidad)) nextErrors.cantidad = "Enter a positive quantity";
        if (!adjustForm.motivo.trim())              nextErrors.motivo   = "Reason is required";
        return nextErrors;
    };

    // Envía el ajuste a la API y recarga ambas tablas al confirmar
    const handleAdjustSubmit = async () => {
        if (!adjustItem) return;

        const nextErrors = validateAdjustForm();
        setAdjustErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            setToast({ message: "Review the fields", type: "error" });
            return;
        }

        const productId = adjustItem.productId || adjustItem.id;
        const payload: InventoryAdjustmentPayload = {
            tipo:       adjustForm.tipo,
            cantidad:   Number(adjustForm.cantidad),
            motivo:     adjustForm.motivo.trim(),
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

    // ── Navegación entre pestañas ────────────────────────────────────────────

    // Cambia a la pestaña de movimientos y prefiltra por el producto seleccionado.
    // Coloca el nombre del producto en el input de búsqueda para que sea visible.
    const handleViewMovements = (item: InventoryItem) => {
        setMovementsSearch(item.nombre || "");
        setMovementsTypeFilter("all");
        setMovementsProductId(item.productId || item.id);
        setMovementsProductName(item.nombre || "");
        setMovementsPage(1);
        setActiveTab("movements");
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="relative flex flex-col h-full overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">

                {/* Toast: notificaciones de éxito y error de operaciones asíncronas */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        duration={1000}
                        onClose={() => setToast(null)}
                        portal={false}
                        overlayClassName="absolute inset-0"
                    />
                )}

                {/* ── Encabezado: título + selector de pestañas ── */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* Ícono y título de la página */}
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

                    {/* Pestañas para cambiar entre Inventario y Movimientos */}
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                        <button
                            onClick={() => setActiveTab("inventory")}
                            className={activeTab === "inventory" ? "signin-btn" : ""}
                        >
                            Inventory
                        </button>
                        <button
                            onClick={() => setActiveTab("movements")}
                            className={activeTab === "movements" ? "signin-btn" : ""}
                        >
                            Movements
                        </button>
                    </div>
                </div>

                {/* ── Barra de resumen y filtros ── */}
                <div className="flex flex-col gap-3">

                    {/* Indicador de métricas según la pestaña activa */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {activeTab === "inventory" ? (
                            /* Inventario: muestra cuántos productos tienen stock bajo */
                            <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                Low stock visible: {lowStockCount}
                            </span>
                        ) : (
                            /* Movimientos: muestra el total de registros encontrados */
                            <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                                <Activity className="h-4 w-4 text-indigo-400" />
                                Movements total: {movementsTotalItems}
                            </span>
                        )}
                    </div>

                    {/* Filtros de la pestaña Inventario */}
                    {activeTab === "inventory" && (
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">

                            {/* Búsqueda por nombre o SKU con botón para limpiar */}
                            <div className="flex flex-1 items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Search by name, sku..."
                                    value={inventorySearch}
                                    onChange={(e) => setInventorySearch(e.target.value)}
                                    className="glass-input"
                                />
                                <button onClick={() => setInventorySearch("")}>
                                    Clear filter
                                </button>
                            </div>

                            {/* Filtro por estado del producto */}
                            <select
                                value={inventoryStatusFilter}
                                onChange={(e) => setInventoryStatusFilter(e.target.value as StatusFilter)}
                                className="glass-input"
                            >
                                <option value="all">All statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            {/* Filtro para ver solo productos con stock bajo */}
                            <select
                                value={inventoryLowStockFilter}
                                onChange={(e) => setInventoryLowStockFilter(e.target.value as LowStockFilter)}
                                className="glass-input"
                            >
                                <option value="all">All stock</option>
                                <option value="low">Low stock</option>
                            </select>
                        </div>
                    )}

                    {/* Filtros de la pestaña Movimientos */}
                    {activeTab === "movements" && (
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">

                            {/* Búsqueda por nombre de producto (se precarga al navegar desde inventario) */}
                            <div className="flex flex-1 items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Search movements..."
                                    value={movementsSearch}
                                    onChange={(e) => setMovementsSearch(e.target.value)}
                                    className="glass-input"
                                />
                                {/* Limpia el texto y el filtro por producto activo */}
                                <button
                                    onClick={() => {
                                        setMovementsSearch("");
                                        setMovementsProductId("");
                                        setMovementsProductName("");
                                    }}
                                >
                                    Clear filter
                                </button>
                            </div>

                            {/* Filtro por tipo de movimiento: entrada, salida o ajuste */}
                            <select
                                value={movementsTypeFilter}
                                onChange={(e) => setMovementsTypeFilter(e.target.value as MovementTypeFilter)}
                                className="glass-input"
                            >
                                <option value="all">All types</option>
                                <option value="ENTRADA">Receipt</option>
                                <option value="SALIDA">Issue</option>
                                <option value="AJUSTE">Adjustment</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* ── Contenido: pestaña Inventario ── */}
                {activeTab === "inventory" && (
                    inventoryLoading ? (
                        <Loading label="Loading inventory..." />
                    ) : (
                        <div className="glass-card overflow-hidden rounded-[30px]">

                            {/* Vista móvil: tarjetas individuales por producto */}
                            <div className="md:hidden space-y-4">
                                {inventoryItems.map((item) => {
                                    const lowStock =
                                        item.lowStock ||
                                        Number(item.stock) <= Number(item.stockMinimo);

                                    return (
                                        <div
                                            key={item.id}
                                            className={`rounded-3xl border border-white/30 bg-white/25 p-4 backdrop-blur-md ${
                                                lowStock ? "bg-amber-50/75" : ""
                                            }`}
                                        >
                                            {/* Cabecera de la tarjeta: nombre, SKU y estado */}
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
                                                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${
                                                        item.activo
                                                            ? "bg-emerald-200 text-emerald-700"
                                                            : "bg-slate-200 text-slate-600"
                                                    }`}
                                                >
                                                    {item.activo ? "Active" : "Inactive"}
                                                </span>
                                            </div>

                                            {/* Datos clave del producto en cuadrícula */}
                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <MobileMeta label="Stock"    value={String(item.stock)} />
                                                <MobileMeta label="Minimum"  value={String(item.stockMinimo)} />
                                                <MobileMeta label="Category" value={item.categoria || "-"} />
                                                <MobileMeta label="Updated"  value={formatDate(item.updatedAt)} />
                                            </div>

                                            {/* Acciones disponibles para el producto */}
                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                <button onClick={() => void openAdjust(item)}>
                                                    Adjust
                                                </button>
                                                <button onClick={() => handleViewMovements(item)}>
                                                    Movements
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Vista escritorio: tabla con todos los campos */}
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
                                                const lowStock =
                                                    item.lowStock ||
                                                    Number(item.stock) <= Number(item.stockMinimo);

                                                return (
                                                    <tr
                                                        key={item.id}
                                                        className={`border-t border-white/18 transition ${
                                                            lowStock ? "bg-amber-50/75" : "hover:bg-white/10"
                                                        }`}
                                                    >
                                                        <td className="px-5 py-5 font-extrabold text-slate-800">
                                                            {item.sku}
                                                        </td>

                                                        {/* Nombre del producto con badge "LOW" si el stock es crítico */}
                                                        <td className="px-5 py-5">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-semibold text-slate-800">
                                                                    {item.nombre}
                                                                </span>
                                                                {lowStock && (
                                                                    <span className="inline-flex w-fit items-center rounded-full border border-rose-300 bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold tracking-[0.22em] text-rose-500">
                                                                        LOW
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-5 text-slate-700">
                                                            {item.categoria || "-"}
                                                        </td>

                                                        {/* Stock resaltado en rojo si está por debajo del mínimo */}
                                                        <td className="px-5 py-5">
                                                            <span className={`font-extrabold ${
                                                                lowStock ? "text-rose-600" : "text-slate-800"
                                                            }`}>
                                                                {item.stock}
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-5 font-semibold text-slate-800">
                                                            {item.stockMinimo}
                                                        </td>

                                                        {/* Badge de estado activo/inactivo */}
                                                        <td className="px-5 py-5 text-center">
                                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                                item.activo
                                                                    ? "bg-emerald-200/80 text-emerald-700"
                                                                    : "bg-slate-200/80 text-slate-600"
                                                            }`}>
                                                                {item.activo ? "Active" : "Inactive"}
                                                            </span>
                                                        </td>

                                                        <td className="px-5 py-5 text-slate-700">
                                                            {formatDate(item.updatedAt)}
                                                        </td>

                                                        {/* Botones de acción por fila */}
                                                        <td className="px-5 py-5 text-center">
                                                            <div className="inline-flex items-center gap-2">
                                                                <button onClick={() => void openAdjust(item)}>
                                                                    Adjust
                                                                </button>
                                                                <button onClick={() => handleViewMovements(item)}>
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

                            {/* Paginación del inventario */}
                            <div className="mt-4 flex flex-col gap-3 border-t border-white/20 px-5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-400">
                                    Page {inventoryPage} of {inventoryTotalPages}
                                </p>
                                <div className="grid grid-cols-2 gap-2 p-3 sm:flex">
                                    <button
                                        onClick={() => setInventoryPage((page) => Math.max(page - 1, 1))}
                                        disabled={!showInventoryPagination || inventoryPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setInventoryPage((page) => Math.min(page + 1, inventoryTotalPages))}
                                        disabled={!showInventoryPagination || inventoryPage === inventoryTotalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                )}

                {/* ── Contenido: pestaña Movimientos ── */}
                {activeTab === "movements" && (
                    movementsLoading ? (
                        <Loading label="Loading movements..." />
                    ) : (
                        <div className="glass-card overflow-hidden rounded-[30px]">

                            {/* Vista móvil: tarjetas individuales por movimiento */}
                            <div className="md:hidden space-y-4">
                                {movements.length > 0 ? (
                                    movements.map((movement) => (
                                        <div
                                            key={movement.id}
                                            className="rounded-3xl border border-white/30 bg-white/25 p-4 backdrop-blur-md"
                                        >
                                            {/* Cabecera: nombre del producto y tipo de movimiento */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-extrabold text-slate-900">
                                                        {movement.productNombre}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        SKU: {movement.sku}
                                                    </p>
                                                </div>

                                                {/* Badge de tipo con color según la operación */}
                                                <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${
                                                    movement.tipo === "ENTRADA"
                                                        ? "bg-emerald-200 text-emerald-700"
                                                        : movement.tipo === "SALIDA"
                                                            ? "bg-rose-200 text-rose-700"
                                                            : "bg-amber-200 text-amber-700"
                                                }`}>
                                                    {movement.tipo === "ENTRADA"
                                                        ? "RECEIPT"
                                                        : movement.tipo === "SALIDA"
                                                            ? "ISSUE"
                                                            : "ADJUSTMENT"
                                                    }
                                                </span>
                                            </div>

                                            {/* Cantidades: actual, anterior y nueva */}
                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <MobileMeta label="Qty"  value={String(movement.cantidad)} />
                                                <MobileMeta label="Prev" value={String(movement.stockAnterior)} />
                                                <MobileMeta label="New"  value={String(movement.stockNuevo)} />
                                                <MobileMeta label="Date" value={formatDate(movement.createdAt)} />
                                            </div>

                                            {/* Motivo y usuario para trazabilidad del movimiento */}
                                            <div className="mt-4 grid gap-3">
                                                <div className="rounded-2xl border border-white/40 bg-white/25 px-3 py-2">
                                                    <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">
                                                        Reason
                                                    </p>
                                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                                        {movement.motivo || "-"}
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl border border-white/40 bg-white/25 px-3 py-2">
                                                    <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">
                                                        User
                                                    </p>
                                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                                        {movement.usuario || "-"}
                                                    </p>
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

                            {/* Vista escritorio: tabla con el historial completo */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-white/25">
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
                                        {movements.length > 0 ? (
                                            movements.map((movement) => (
                                                <tr
                                                    key={movement.id}
                                                    className="border-t border-white/18 transition hover:bg-white/10"
                                                >
                                                    <td className="px-5 py-5 font-extrabold text-slate-800">
                                                        {movement.sku}
                                                    </td>
                                                    <td className="px-5 py-5 text-slate-700">
                                                        {movement.productNombre}
                                                    </td>

                                                    {/* Tipo de movimiento con color identificador */}
                                                    <td className="px-5 py-5">
                                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                            movement.tipo === "ENTRADA"
                                                                ? "bg-emerald-200/80 text-emerald-700"
                                                                : movement.tipo === "SALIDA"
                                                                    ? "bg-rose-200/80 text-rose-700"
                                                                    : "bg-amber-200/80 text-amber-700"
                                                        }`}>
                                                            {movement.tipo === "ENTRADA"
                                                                ? "RECEIPT"
                                                                : movement.tipo === "SALIDA"
                                                                    ? "ISSUE"
                                                                    : "ADJUSTMENT"
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-5 font-semibold text-slate-800">
                                                        {movement.cantidad}
                                                    </td>
                                                    <td className="px-5 py-5 text-slate-700">
                                                        {movement.stockAnterior}
                                                    </td>
                                                    <td className="px-5 py-5 text-slate-700">
                                                        {movement.stockNuevo}
                                                    </td>
                                                    <td className="px-5 py-5 text-slate-700">
                                                        {movement.motivo || "-"}
                                                    </td>
                                                    <td className="px-5 py-5 text-slate-700">
                                                        {movement.usuario || "-"}
                                                    </td>
                                                    <td className="px-5 py-5 text-slate-700">
                                                        {formatDate(movement.createdAt)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={9} className="px-5 py-14 text-center text-slate-500">
                                                    No movements registered
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación de movimientos */}
                            <div className="mt-4 flex flex-col gap-3 border-t border-white/20 px-5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-400">
                                    Page {movementsPage} of {movementsTotalPages}
                                </p>
                                <div className="grid grid-cols-2 gap-2 p-3 sm:flex">
                                    <button
                                        onClick={() => setMovementsPage((page) => Math.max(page - 1, 1))}
                                        disabled={!showMovementsPagination || movementsPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setMovementsPage((page) => Math.min(page + 1, movementsTotalPages))}
                                        disabled={!showMovementsPagination || movementsPage === movementsTotalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                )}

            </div>

            {/* ── Modal de ajuste de inventario ── */}
            {adjustOpen && (
                <div className="app-modal-overlay app-modal-overlay px-4 py-4 rounded-[40px]">
                    <div className="app-modal-shell app-modal-shell--lg glass-card rounded-t-[28px] sm:rounded-[28px] p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">

                        {/* Encabezado del modal */}
                        <div className="mb-5">
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                Adjust inventory
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Register an entry, exit, or adjustment movement.
                            </p>
                        </div>

                        {/* Mientras se recarga el producto se muestra un spinner */}
                        {adjustLoading ? (
                            <Loading label="Loading inventory detail..." />
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">

                                {/* Producto y stock actual (solo lectura, para referencia) */}
                                <Field label="Product">
                                    <input
                                        value={`${adjustItem?.sku || ""} ${adjustItem?.nombre || ""}`.trim()}
                                        readOnly
                                        className="glass-input w-full"
                                    />
                                </Field>

                                <Field label="Current stock">
                                    <input
                                        value={adjustItem?.stock ?? "-"}
                                        readOnly
                                        className="glass-input w-full"
                                    />
                                </Field>

                                {/* Campos editables del ajuste */}
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

                                <Field label="Reason" error={adjustErrors.motivo}>
                                    <input
                                        name="motivo"
                                        value={adjustForm.motivo}
                                        onChange={handleAdjustChange}
                                        className="glass-input w-full"
                                        placeholder="Damage, recount, supplier return..."
                                    />
                                </Field>

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

                        {/* Acciones del modal: cancelar o confirmar el ajuste */}
                        <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
                            <button onClick={closeAdjust}>
                                Cancel
                            </button>
                            <button
                                onClick={() => void handleAdjustSubmit()}
                                disabled={adjustSaving || adjustLoading}
                                className="signin-btn"
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

// ── Componentes auxiliares ────────────────────────────────────────────────────

// Agrupa etiqueta, campo de formulario y mensaje de error de validación
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
            <span>{label}</span>
            {children}
            {error && <span className="text-xs font-medium text-rose-600">{error}</span>}
        </label>
    );
}

// Bloque compacto de dato+etiqueta usado en las tarjetas móviles
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
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">
                {label}
            </p>
            <p className={`mt-1 text-sm font-semibold text-slate-800 ${valueClassName || ""}`}>
                {value}
            </p>
        </div>
    );
}
