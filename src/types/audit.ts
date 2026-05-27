export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  userId: string;
  usuario: string;
  createdAt: string;
}