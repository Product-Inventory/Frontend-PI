export interface ReceptionItem {
	productId: string;
	sku: string;
	productNombre: string;
	cantidad: number;
	costoUnitario: number;
	subtotal: number;
}

export interface Reception {
	id: string;
	supplierId: string;
	supplierNombre: string;
	fecha: string;
	folio: string;
	comentarios: string;
	status: "DRAFT" | "CONFIRMED";
	items: ReceptionItem[];
	total: number;
	confirmedAt: string | null;
	confirmedBy: string;
	confirmedByUserId: string;
	createdBy: string;
	createdByUserId: string;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface ReceptionFormValues {
	supplierId: string;
	fecha: string;
	folio: string;
	comentarios: string | null;
	items: ReceptionItem[];
}
