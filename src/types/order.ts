export type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  productId: string;
  sku: string;
  productNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
export interface Order {
  id: string;
  folio: string;
  fecha: string;
  clienteId: string;
  clienteNombre: string;
  comentarios: string | null;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  impuestos: number;
  total: number;
  confirmedAt: string | null;
  confirmedBy: string | null;
  confirmedByUserId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface OrderFormValues {
  folio: string;
  fecha: string;
  clienteId: string;
  comentarios: string | null;
  items: Array<{
    productId: string;
    cantidad: number | string;
    precioUnitario: number | string;
    productNombre?: string;
    sku?: string;
    subtotal?: number;
  }>;
}

export interface OrderQueryParams {
  q?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
}