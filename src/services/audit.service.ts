import { api } from "./api";

export const auditService = {
  async getAll() {
    const { data } = await api.get("/audit");
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get(`/audit/${id}`);
    return data;
  },
};