// Fake order service aún falta implementar, pero sirve para simular la estructura de llamadas y respuestas
export const ordersService = {
  async getAll(_params: any) {
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
    };
  },
  async getById(_id: string) {
    return { item: null };
  },
  async create(_data: any) {
    return { message: "Simulado", item: null };
  },
  async update(_id: string, _data: any) {
    return { message: "Simulado", item: null };
  },
  async delete(_id: string) {
    return { message: "Simulado" };
  },
  async confirm(_id: string) {
    return { message: "Simulado", item: null };
  },
};