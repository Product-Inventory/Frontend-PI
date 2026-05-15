export interface Client {
  id: string;
  nombre: string;
  rfc: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  contacto: string | null;
  notas: string | null;
  activo: boolean | string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ClientQueryParams {
  q?: string;
  activo?: boolean | string;
  page?: number;
  limit?: number;
}

export interface ClientFormValues {
  nombre: string;
  rfc: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  contacto: string | null;
  notas: string | null;
  activo: boolean | string | null;
}