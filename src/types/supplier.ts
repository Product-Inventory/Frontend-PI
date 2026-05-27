export interface Supplier {
  id: string;
  nombre: string;
  rfc: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  contacto: string | null;
  giro: string | null;
  notas: string | null;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}