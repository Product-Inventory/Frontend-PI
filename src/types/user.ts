export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  usuario: string;
  role: string | null;
  roleId: string | null;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}