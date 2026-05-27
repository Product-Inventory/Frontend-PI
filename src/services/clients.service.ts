import { api } from "./api";
import type { PaginatedResponse } from "@/types/pagination";
import type { Client, ClientFormValues, ClientQueryParams } from "@/types/client";

function normalizeOptionalText(value: string | null | undefined) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

function buildPayload(data: ClientFormValues) {
  return {
    nombre: String(data.nombre || "").trim(),
    rfc: normalizeOptionalText(data.rfc),
    email: normalizeOptionalText(data.email),
    telefono: normalizeOptionalText(data.telefono),
    direccion: normalizeOptionalText(data.direccion),
    contacto: normalizeOptionalText(data.contacto),
    notas: normalizeOptionalText(data.notas),
    activo: data.activo,
  };
}

function buildUpdatePayload(data: Partial<ClientFormValues>) {
  const payload: Record<string, unknown> = {};
  if (data.nombre !== undefined) payload.nombre = String(data.nombre || "").trim();
  if (data.rfc !== undefined) payload.rfc = normalizeOptionalText(data.rfc);
  if (data.email !== undefined) payload.email = normalizeOptionalText(data.email);
  if (data.telefono !== undefined) payload.telefono = normalizeOptionalText(data.telefono);
  if (data.direccion !== undefined) payload.direccion = normalizeOptionalText(data.direccion);
  if (data.contacto !== undefined) payload.contacto = normalizeOptionalText(data.contacto);
  if (data.notas !== undefined) payload.notas = normalizeOptionalText(data.notas);
  if (data.activo !== undefined) payload.activo = data.activo;
  return payload;
}

export const clientsService = {
  async getAll(params: ClientQueryParams = {}) {
    const res = await api.get<PaginatedResponse<Client>>("/clients", { params });
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get<{ item: Client }>(`/clients/${id}`);
    return res.data;
  },

  async create(data: ClientFormValues) {
    const res = await api.post<{ message: string; item: Client }>("/clients", buildPayload(data));
    return res.data;
  },

  async update(id: string, data: Partial<ClientFormValues>) {
    const res = await api.patch<{ message: string; item: Client }>(`/clients/${id}`, buildUpdatePayload(data));
    return res.data;
  },

  async toggleActive(id: string, activo: boolean) {
    const res = await api.patch<{ message: string; item: Client }>(`/clients/${id}/toggle-active`, { activo });
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete<{ message: string }>(`/clients/${id}`);
    return res.data;
  },
};