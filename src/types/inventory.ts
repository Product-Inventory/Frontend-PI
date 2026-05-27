export interface InventoryItem {
	id: string;
	productId: string;
	sku: string;
	nombre: string;
	descripcion: string;
	categoria: string;
	unidad: string;
	marca: string;
	modelo: string;
	stock: number;
	stockMinimo: number;
	lowStock: boolean;
	activo: boolean;
	updatedAt: string | null;
}

export interface InventoryMovement {
	id: string;
	productId: string;
	sku: string;
	productNombre: string;
	tipo: "ENTRADA" | "SALIDA" | "AJUSTE";
	cantidad: number;
	stockAnterior: number;
	stockNuevo: number;
	motivo: string;
	referencia: string;
	userId: string;
	usuario: string;
	createdAt: string | null;
}

export interface InventoryAdjustmentPayload {
	tipo: "ENTRADA" | "SALIDA" | "AJUSTE";
	cantidad: number;
	motivo: string;
	referencia?: string | null;
}

export interface InventoryQueryParams {
	q?: string;
	activo?: boolean;
	lowStock?: boolean;
	page?: number;
	limit?: number;
}

export interface InventoryMovementsQueryParams {
	q?: string;
	productId?: string;
	tipo?: InventoryMovement["tipo"];
	page?: number;
	limit?: number;
}
