export interface Role {
  id: string;
  nombre: string;
  descripcion?: string;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}
