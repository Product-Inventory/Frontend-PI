"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { usersService } from "@/services/users.service";
import { User } from "@/types/user";
import Loading from "@/components/ui/Loading";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    usuario: "",
    password: "",
    roleId: "role_admin",
    activo: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await usersService.getAll();
      setUsers(data.items);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Validaciones del formulario
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.nombre.trim()) errors.nombre = "Nombre obligatorio";
    if (!form.apellido.trim()) errors.apellido = "Apellido obligatorio";
    if (!form.email.trim()) errors.email = "Email obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Email inválido";
    if (!form.usuario.trim()) errors.usuario = "Usuario obligatorio";
    if (!editingUser && !form.password) errors.password = "Contraseña obligatoria";
    else if (!editingUser && form.password.length < 4)
      errors.password = "Mínimo 4 caracteres";
    if (!form.roleId) errors.roleId = "Rol obligatorio";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CREATE
  const openCreate = () => {
    setEditingUser(null);
    setForm({
      nombre: "",
      apellido: "",
      email: "",
      usuario: "",
      password: "",
      roleId: "role_admin",
      activo: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // EDIT
  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      usuario: user.usuario,
      password: "",
      roleId: user.roleId || "role_admin",
      activo: user.activo,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Limpiar error del campo al escribir
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      if (editingUser) {
        const updateData: any = { ...form };
        if (!updateData.password) delete updateData.password;
        await usersService.update(editingUser.id, updateData);
      } else {
        await usersService.create(form);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al guardar usuario");
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await usersService.toggleActive(user.id, !user.activo);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al cambiar estado");
    }
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await usersService.delete(userToDelete.id);
      fetchUsers();
      setConfirmOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al eliminar usuario");
    }
  };

  // Filtro por búsqueda
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.nombre} ${u.apellido}`.toLowerCase();
    const searchLower = search.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      u.usuario.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const columns = [
    { header: "Nombre", accessor: "nombre" as const, render: (row: User) => `${row.nombre} ${row.apellido}` },
    { header: "Usuario", accessor: "usuario" as const },
    { header: "Email", accessor: "email" as const },
    { header: "Rol", accessor: "role" as const, render: (row: User) => row.role || "Sin rol" },
    {
      header: "Estado",
      accessor: "activo" as const,
      render: (row: User) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.activo ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}>
          {row.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "",
      render: (row: User) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => openEdit(row)}
            className="btn btn-ghost btn-xs opacity-70 hover:opacity-100"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={() => handleToggleActive(row)}
            className="btn btn-ghost btn-xs opacity-70 hover:opacity-100"
            title={row.activo ? "Desactivar" : "Activar"}
          >
            {row.activo ? "🔇" : "🔁"}
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="btn btn-ghost btn-xs opacity-70 hover:opacity-100 text-red-500"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold text-gray-800 tracking-tight">
          Usuarios
        </h1>
        <button
          onClick={openCreate}
          className="px-5 py-2 text-sm bg-white/20 backdrop-blur-sm border border-white/40 rounded-full shadow-md hover:bg-white/30 transition"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Search */}
      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Buscar por nombre, usuario o email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="glass-input w-64"
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="glass-card rounded-2xl p-6">
          <DataTable columns={columns} data={paginatedUsers} />
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-400">
              Página {currentPage} de {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de creación/edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <input
                  name="nombre"
                  placeholder="Nombre *"
                  value={form.nombre}
                  onChange={handleChange}
                  className="glass-input w-full"
                />
                {formErrors.nombre && <p className="text-red-300 text-xs mt-1">{formErrors.nombre}</p>}
              </div>
              <div>
                <input
                  name="apellido"
                  placeholder="Apellido *"
                  value={form.apellido}
                  onChange={handleChange}
                  className="glass-input w-full"
                />
                {formErrors.apellido && <p className="text-red-300 text-xs mt-1">{formErrors.apellido}</p>}
              </div>
              <div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email *"
                  value={form.email}
                  onChange={handleChange}
                  className="glass-input w-full"
                />
                {formErrors.email && <p className="text-red-300 text-xs mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <input
                  name="usuario"
                  placeholder="Usuario *"
                  value={form.usuario}
                  onChange={handleChange}
                  className="glass-input w-full"
                />
                {formErrors.usuario && <p className="text-red-300 text-xs mt-1">{formErrors.usuario}</p>}
              </div>
              <div>
                <input
                  name="password"
                  type="password"
                  placeholder={editingUser ? "Nueva contraseña (opcional)" : "Contraseña *"}
                  value={form.password}
                  onChange={handleChange}
                  className="glass-input w-full"
                />
                {formErrors.password && <p className="text-red-300 text-xs mt-1">{formErrors.password}</p>}
              </div>
              <div>
                <select
                  name="roleId"
                  value={form.roleId}
                  onChange={handleChange}
                  className="glass-input w-full"
                >
                  <option value="role_admin">Administrador</option>
                  <option value="role_user">Usuario</option>
                </select>
                {formErrors.roleId && <p className="text-red-300 text-xs mt-1">{formErrors.roleId}</p>}
              </div>
              <label className="flex items-center gap-2 text-white/80">
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={handleChange}
                />
                Activo
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                Cancelar
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-white/20 rounded-full hover:bg-white/30 transition font-semibold">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Eliminar usuario"
        message={`¿Deseas eliminar al usuario "${userToDelete?.nombre} ${userToDelete?.apellido}"?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
}