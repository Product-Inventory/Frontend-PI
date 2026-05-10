import { api } from "./api";
import type { PaginatedResponse } from "@/types/pagination";
import type { Product, ProductFormValues, ProductQueryParams } from "@/types/product";

function normalizeOptionalText(value: string | null | undefined) {
	if (value === undefined || value === null) return null;

	const trimmed = String(value).trim();
	return trimmed === "" ? null : trimmed;
}

function toNumber(value: number | string) {
	return Number(value || 0);
}

function buildPayload(data: ProductFormValues) {
	return {
		sku: String(data.sku || "").trim().toUpperCase(),
		nombre: String(data.nombre || "").trim(),
		descripcion: normalizeOptionalText(data.descripcion),
		categoria: normalizeOptionalText(data.categoria),
		unidad: normalizeOptionalText(data.unidad),
		marca: normalizeOptionalText(data.marca),
		modelo: normalizeOptionalText(data.modelo),
		precioCompra: toNumber(data.precioCompra),
		precioVenta: toNumber(data.precioVenta),
		stock: toNumber(data.stock),
		stockMinimo: toNumber(data.stockMinimo),
		activo: data.activo,
	};
}

function buildUpdatePayload(data: Partial<ProductFormValues>) {
	const payload: Record<string, unknown> = {};

	if (data.sku !== undefined) payload.sku = String(data.sku || "").trim().toUpperCase();
	if (data.nombre !== undefined) payload.nombre = String(data.nombre || "").trim();
	if (data.descripcion !== undefined) payload.descripcion = normalizeOptionalText(data.descripcion);
	if (data.categoria !== undefined) payload.categoria = normalizeOptionalText(data.categoria);
	if (data.unidad !== undefined) payload.unidad = normalizeOptionalText(data.unidad);
	if (data.marca !== undefined) payload.marca = normalizeOptionalText(data.marca);
	if (data.modelo !== undefined) payload.modelo = normalizeOptionalText(data.modelo);
	if (data.precioCompra !== undefined) payload.precioCompra = toNumber(data.precioCompra);
	if (data.precioVenta !== undefined) payload.precioVenta = toNumber(data.precioVenta);
	if (data.stock !== undefined) payload.stock = toNumber(data.stock);
	if (data.stockMinimo !== undefined) payload.stockMinimo = toNumber(data.stockMinimo);
	if (data.activo !== undefined) payload.activo = data.activo;

	return payload;
}

export const productsService = {
	async getAll(params: ProductQueryParams = {}) {
		const res = await api.get<PaginatedResponse<Product>>("/products", { params });
		return res.data;
	},

	async getById(id: string) {
		const res = await api.get<{ item: Product }>(`/products/${id}`);
		return res.data;
	},

	async create(data: ProductFormValues) {
		const res = await api.post<{ message: string; item: Product }>("/products", buildPayload(data));
		return res.data;
	},

	async update(id: string, data: Partial<ProductFormValues>) {
		const res = await api.patch<{ message: string; item: Product }>(`/products/${id}`, buildUpdatePayload(data));
		return res.data;
	},

	async toggleActive(id: string, activo: boolean) {
		const res = await api.patch<{ message: string; item: Product }>(`/products/${id}/toggle-active`, { activo });
		return res.data;
	},

	async delete(id: string) {
		const res = await api.delete<{ message: string }>(`/products/${id}`);
		return res.data;
	},
};
