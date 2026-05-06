export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  usuario: string;
  role: string;
  roleId: string | null;
  permissions: string[]; 
  activo: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  usuario: string; 
  password: string;
}