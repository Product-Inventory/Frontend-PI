import { api } from "./api";
import type { PaginatedResponse } from "@/types/pagination";
import type { Order, OrderFormValues, OrderQueryParams,} from "@/types/order";

function normalizeOptionalText(value: string | null | undefined) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

function toNumber(value: number | string) {
  return Number(value || 0);
}

function buildPayload(data: OrderFormValues) {
  return {
    // folio: generado automáticamente por el backend
    fechaOrden: data.fechaOrden,
    fechaEntrega: data.fechaEntrega ?? null,
    clienteId: String(data.clienteId || "").trim(),
    comentarios: normalizeOptionalText(data.comentarios),
    items: (data.items || []).map((item) => ({
      productId: String(item.productId || "").trim(),
      cantidad: toNumber(item.cantidad),
      precioUnitario: toNumber(item.precioUnitario),
    })),
  };
}

function buildUpdatePayload(data: Partial<OrderFormValues>) {
  const payload: Record<string, unknown> = {};
  // folio: no editable después de la creación
  if (data.fechaOrden !== undefined) {
    payload.fechaOrden = data.fechaOrden;
  }
  if (data.fechaEntrega !== undefined) {
    payload.fechaEntrega = data.fechaEntrega ?? null;
  }
  if (data.clienteId !== undefined) {
    payload.clienteId = String(data.clienteId || "").trim();
  }
  if (data.comentarios !== undefined) {
    payload.comentarios = normalizeOptionalText(data.comentarios);
  }
  if (data.items !== undefined) {
    payload.items = data.items.map((item) => ({
      productId: String(item.productId || "").trim(),
      cantidad: toNumber(item.cantidad),
      precioUnitario: toNumber(item.precioUnitario),
    }));
  }
  return payload;
}

export const ordersService = {
  async getAll(params: OrderQueryParams = {}) {
    const res = await api.get<PaginatedResponse<Order>>(
      "/orders",
      { params }
    );
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get<{ item: Order }>(
      `/orders/${id}`
    );
    return res.data;
  },

  async create(data: OrderFormValues) {
    const res = await api.post<{
      message: string;
      item: Order;
    }>("/orders", buildPayload(data));
    return res.data;
  },

  async update(
    id: string,
    data: Partial<OrderFormValues>
  ) {
    const res = await api.patch<{
      message: string;
      item: Order;
    }>(
      `/orders/${id}`,
      buildUpdatePayload(data)
    );
    return res.data;
  },

  async confirm(id: string) {
    const res = await api.patch<{
      message: string;
      item: Order;
    }>(`/orders/${id}/confirm`);
    return res.data;
  },

  async cancel(id: string) {
    const res = await api.patch<{
      message: string;
      item: Order;
    }>(`/orders/${id}/cancel`);
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete<{
      message: string;
    }>(`/orders/${id}`);
    return res.data;
  },

  async deliver(id: string, fechaEntrega: string) {
    const res = await api.patch<{ message: string; item: Order }>(`/orders/${id}/deliver`, { fechaEntrega });
    return res.data;
  }
};