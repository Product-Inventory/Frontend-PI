import { api } from "./api";
import { Reception, ReceptionFormValues } from "@/types/reception";

export const receptionsService = {
  async getAll(params?: { q?: string; status?: string; page?: number; limit?: number }) {
    const res = await api.get("/recepciones", { params });
    return res.data; // { items: Reception[], total, page, limit }
  },

  async getById(id: string) {
    const res = await api.get(`/recepciones/${id}`);
    return res.data; // { item: Reception }
  },

  async create(data: ReceptionFormValues) {
    const res = await api.post("/recepciones", data);
    return res.data;
  },

  async update(id: string, data: Partial<ReceptionFormValues>) {
    const res = await api.patch(`/recepciones/${id}`, data);
    return res.data;
  },

  async confirm(id: string) {
    const res = await api.patch(`/recepciones/${id}/confirm`, {});
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/recepciones/${id}`);
    return res.data;
  },
};