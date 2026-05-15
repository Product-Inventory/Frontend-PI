export interface DashboardSummary {

  totals: {
    users: number;
    activeUsers: number;
    clients: number;
    activeClients: number;
    suppliers: number;
    activeSuppliers: number;
    products: number;
    activeProducts: number;
    recepciones: number;
  };

  lowStockCount: number;

  lowStockProducts: {
    id: string;
    sku: string;
    nombre: string;
    stock: number;
    stockMinimo: number;
    lowStock: boolean;
    activo: boolean;
  }[];

  recentAudit: {
    id: string;
    action: string;
    resource: string;
    usuario: string;
    createdAt: string;
  }[];

  recentInventoryMovements: any[];

  recepcionesRecientes: any[];
}