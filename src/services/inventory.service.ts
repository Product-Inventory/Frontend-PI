import { api } from "./api";
import type { PaginatedResponse } from "@/types/pagination";
import type {
    InventoryAdjustmentPayload,
    InventoryItem,
    InventoryMovement,
    InventoryMovementsQueryParams,
    InventoryQueryParams,
} from "@/types/inventory";

function normalizeOptionalText(value: string | null | undefined) {
    if (value === undefined || value === null) return null;

    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
}

function toNumber(value: number | string) {
    return Number(value || 0);
}

function buildAdjustmentPayload(payload: InventoryAdjustmentPayload) {
    return {
        tipo: payload.tipo,
        cantidad: toNumber(payload.cantidad),
        motivo: String(payload.motivo || "").trim(),
        referencia: normalizeOptionalText(payload.referencia),
    };
}

export const inventoryService = {
    async getAll(params: InventoryQueryParams = {}) {
        const res = await api.get<PaginatedResponse<InventoryItem>>("/inventory", { params });
        return res.data;
    },

    async getMovements(params: InventoryMovementsQueryParams = {}) {
        const res = await api.get<PaginatedResponse<InventoryMovement>>("/inventory/movements", { params });
        return res.data;
    },

    async getByProductId(productId: string) {
        const res = await api.get<{ item: InventoryItem }>(`/inventory/${productId}`);
        return res.data;
    },

    async adjust(productId: string, payload: InventoryAdjustmentPayload) {
        const res = await api.patch<{
            message: string;
            item: InventoryItem;
            movement: InventoryMovement;
        }>(`/inventory/${productId}/adjust`, buildAdjustmentPayload(payload));
        return res.data;
    },
};
