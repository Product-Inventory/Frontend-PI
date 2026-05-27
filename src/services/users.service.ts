import { api } from "./api";

export const usersService = {
  async getAll() {
    const res = await api.get("/users");
    return res.data; 
  },

  async getById(id: string) {
    const res = await api.get(`/users/${id}`);
    return res.data; 
  },

  async create(data: any) {
    const res = await api.post("/users", data);
    return res.data;
  },

  async update(id: string, data: any) {
    const res = await api.patch(`/users/${id}`, data);
    return res.data;
  },

  async toggleActive(id: string, activo: boolean) {
    const res = await api.patch(`/users/${id}/toggle-active`, { activo });
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};