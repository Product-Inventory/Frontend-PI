export interface Permission {
  id: string;
  code: string;
  nombre: string;
  descripcion: string;
  modulo: string;
}

export function hasPermission(user, neededPermission: string) {
  return user?.permisos?.includes(neededPermission);
}