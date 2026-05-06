import { api } from "./api";

export const rolesService = {
  async getAll() {
    const res = await api.get("/roles");
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get(`/roles/${id}`);
    return res.data;
  },

  async create(data: any) {
    const res = await api.post(`/roles`, data);
    return res.data;
  },

  async update(id: string, data: any) {
    const res = await api.patch(`/roles/${id}`, data);
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/roles/${id}`);
    return res.data;
  },
};
