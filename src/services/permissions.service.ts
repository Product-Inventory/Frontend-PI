import { api } from "./api";

export const permissionsService = {
  async getAll() {
    const res = await api.get("/permissions");
    return res.data;
  },

  async create(data: any) {
    const res = await api.post("/permissions", data);
    return res.data;
  },

  async update(id: string, data: any) {
    const res = await api.patch(`/permissions/${id}`, data);
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/permissions/${id}`);
    return res.data;
  }
};