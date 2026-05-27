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
  subtotal?: number;
}

export interface Order {
  id: string;
  folio: string;
  fechaOrden: string; 
  fechaEntrega: string | null;
  clienteId: string;
  clienteNombre: string;
  comentarios: string | null;
  status: OrderStatus;
  items: OrderItem[];
  impuestos: number;
  total: number;
  confirmedAt: string | null;
  confirmedBy: string | null;
  confirmedByUserId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface OrderFormValues {
  // folio: generado automáticamente por el backend
  fechaOrden: string;
  fechaEntrega: string | null;
  clienteId: string;
  comentarios: string | null;
  items: Array<{
    productId: string;
    cantidad: number | string;
    precioUnitario: number | string;
    productNombre?: string;
    sku?: string;
  }>;
}

export interface OrderQueryParams {
  q?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
}