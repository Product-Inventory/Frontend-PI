import { api } from "./api";

import { Reception, ReceptionFormValues } from "@/types/reception";

export const receptionsService = {
  async getAll(params?: { q?: string; status?: string; page?: number; limit?: number }) {
    const res = await api.get("/recepciones", { params });
    return res.data; // { items: Reception[], total, page, limit }
  },

  async getById(id: string) {
    const res = await api.get(`/recepciones/${id}`);
    return res.data; // { item: Reception }
  },

  async create(data: ReceptionFormValues) {
    const res = await api.post("/recepciones", data);

import type { PaginatedResponse } from "@/types/pagination";
import type {
  Reception,
  ReceptionFormValues,
  ReceptionQueryParams,
} from "@/types/reception";

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

function buildPayload(data: ReceptionFormValues) {
  return {
    supplierId: data.supplierId,
    fecha: data.fecha,
    folio: String(data.folio || "").trim(),
    comentarios: normalizeOptionalText(data.comentarios),
    items: Array.isArray(data.items)
      ? data.items.map((item) => ({
          productId: item.productId,
          cantidad: Number(item.cantidad),
          costoUnitario: Number(item.costoUnitario),
        }))
      : [],
  };
}

function buildUpdatePayload(data: Partial<ReceptionFormValues>) {
  const payload: Record<string, unknown> = {};
  if (data.supplierId !== undefined) payload.supplierId = data.supplierId;
  if (data.fecha !== undefined) payload.fecha = data.fecha;
  if (data.folio !== undefined) payload.folio = String(data.folio || "").trim();
  if (data.comentarios !== undefined)
    payload.comentarios = normalizeOptionalText(data.comentarios);
  if (data.items !== undefined)
    payload.items = Array.isArray(data.items)
      ? data.items.map((item) => ({
          productId: item.productId,
          cantidad: Number(item.cantidad),
          costoUnitario: Number(item.costoUnitario),
        }))
      : [];
  return payload;
}

export const receptionsService = {
  async getAll(params: ReceptionQueryParams = {}) {
    const res = await api.get<PaginatedResponse<Reception>>("/recepciones", { params });
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get<{ item: Reception }>(`/recepciones/${id}`);
    return res.data;
  },

  async create(data: ReceptionFormValues) {
    const res = await api.post<{ message: string; item: Reception }>("/recepciones", buildPayload(data));

    return res.data;
  },

  async update(id: string, data: Partial<ReceptionFormValues>) {

    const res = await api.patch(`/recepciones/${id}`, data);

    const res = await api.patch<{ message: string; item: Reception }>(`/recepciones/${id}`, buildUpdatePayload(data));

    return res.data;
  },

  async confirm(id: string) {

    const res = await api.patch(`/recepciones/${id}/confirm`, {});

    // Confirm returns { message, item, movements }
    const res = await api.patch<{ message: string; item: Reception; movements: any[] }>(
      `/recepciones/${id}/confirm`
    );

    return res.data;
  },

  async delete(id: string) {

    const res = await api.delete(`/recepciones/${id}`);

    const res = await api.delete<{ message: string }>(`/recepciones/${id}`);

    return res.data;
  },
};