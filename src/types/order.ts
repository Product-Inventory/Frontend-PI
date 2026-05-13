export interface Order {
  id: string;
  folio: string;
  fecha: string;
  clienteNombre: string;
  total: number;
  status: "DRAFT" | "CONFIRMED";
  createdAt: string | null;
  updatedAt: string | null;
}

export interface OrderFormValues {
  folio: string;
  fecha: string;
  clienteId: string;
  items: Array<{ productId: string; cantidad: number | string; precio: number | string }>;
  comentarios: string | null;
}

export interface OrderQueryParams {
  q?: string;
  status?: "DRAFT" | "CONFIRMED";
  page?: number;
  limit?: number;
}