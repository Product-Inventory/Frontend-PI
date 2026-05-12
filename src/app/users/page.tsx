"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { usersService } from "@/services/users.service";
import { User } from "@/types/user";
import Loading from "@/components/ui/Loading";
import ConfirmModal from "@/components/ui/ConfirmModal";
import UserFormModal from "@/components/forms/UserFormModal";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const itemsPerPage = 5;

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
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
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al eliminar");
    } finally {
      setConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  // Filtro local
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.nombre} ${u.apellido}`.toLowerCase();
    const term = search.toLowerCase();
    return (
      fullName.includes(term) ||
      u.usuario.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns = [
    { header: "Nombre", accessor: "nombre" as const, render: (row: User) => `${row.nombre} ${row.apellido}` },
    { header: "Usuario", accessor: "usuario" as const },
    { header: "Email", accessor: "email" as const },
    {
      header: "Rol",
      accessor: "role" as const,
      render: (row: User) => {
        // Si el backend envía el nombre del rol, lo mostramos
        if (row.role) return row.role;
        // Si no, pero tenemos roleId, mostramos el ID (o un mapeo)
        if (row.roleId) return row.roleId;
        return "Sin rol";
      },
    },
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
            onClick={() => handleEdit(row)}
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
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold text-gray-800 tracking-tight">Usuarios</h1>
        <button
          onClick={handleCreate}
          className="px-5 py-2 text-sm bg-white/20 backdrop-blur-sm border border-white/40 rounded-full shadow-md hover:bg-white/30 transition"
        >
          + Nuevo Usuario
        </button>
      </div>

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
            <p className="text-sm text-gray-400">Página {currentPage} de {totalPages || 1}</p>
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

      {/* Modal reutilizable con roles dinámicos */}
      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchUsers}
        user={editingUser}
      />

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