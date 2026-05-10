export interface Product {
	id: string;
	sku: string;
	nombre: string;
	descripcion: string;
	categoria: string;
	unidad: string;
	marca: string;
	modelo: string;
	precioCompra: number;
	precioVenta: number;
	stock: number;
	stockMinimo: number;
	activo: boolean;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface ProductQueryParams {
	q?: string;
	activo?: boolean;
	page?: number;
	limit?: number;
}

export interface ProductFormValues {
	sku: string;
	nombre: string;
	descripcion: string | null;
	categoria: string | null;
	unidad: string | null;
	marca: string | null;
	modelo: string | null;
	precioCompra: number | string;
	precioVenta: number | string;
	stock: number | string;
	stockMinimo: number | string;
	activo: boolean;
}
