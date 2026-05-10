import { api } from "./api";

export const suppliersService = {
  async getAll() {
    const res = await api.get("/suppliers");
    return res.data; // { items, total, page, limit }
  },

  async getById(id: string) {
    const res = await api.get(`/suppliers/${id}`);
    return res.data; // { item }
  },

  async create(data: any) {
    const res = await api.post("/suppliers", data);
    return res.data;
  },

  async update(id: string, data: any) {
    const res = await api.patch(`/suppliers/${id}`, data);
    return res.data;
  },

  async toggleActive(id: string, activo: boolean) {
    const res = await api.patch(`/suppliers/${id}/toggle-active`, { activo });
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/suppliers/${id}`);
    return res.data;
  },
};