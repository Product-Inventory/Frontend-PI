"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { usersService } from "@/services/users.service";
import { User } from "@/types/user";
import Loading from "@/components/ui/Loading";
import ConfirmModal from "@/components/ui/ConfirmModal";
import UserFormModal from "@/components/forms/UserFormModal";
import { Toast } from "@/components/ui/Toast";
import { Plus, Power } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const itemsPerPage = 5;

  const fetchUsers = async () => {
    try {
      const data = await usersService.getAll();
      setUsers(data.items);
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error loading users", type: "error" });
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
      setToast({ message: `User ${user.activo ? "deactivated" : "activated"} successfully`, type: "success" });
      fetchUsers();
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error toggling status", type: "error" });
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
      setToast({ message: "User deleted successfully", type: "success" });
      fetchUsers();
      setConfirmOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error deleting user", type: "error" });
    }
  };

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
    { header: "Name", accessor: "nombre" as const, render: (row: User) => `${row.nombre} ${row.apellido}` },
    { header: "Username", accessor: "usuario" as const },
    { header: "Email", accessor: "email" as const },
    {
      header: "Role",
      accessor: "role" as const,
      render: (row: User) => row.role || (row.roleId === 'role_admin' ? 'Admin' : row.roleId === 'role_user' ? 'User' : 'No role'),
    },
    {
      header: "Status",
      accessor: "activo" as const,
      render: (row: User) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.activo ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}>
          {row.activo ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row: User) => (
        <div className="flex gap-2 justify-end">
          <button onClick={() => handleEdit(row)} className="text-blue-200 hover:text-blue-100" title="Edit">
            ✏️
          </button>
          <button onClick={() => handleToggleActive(row)} className="text-yellow-200 hover:text-yellow-100 flex items-center gap-1" title={row.activo ? "Deactivate" : "Activate"}>
            <Power className="h-4 w-4" />
            <span className="text-xs">{row.activo ? "Off" : "On"}</span>
          </button>
          <button onClick={() => handleDelete(row)} className="text-red-200 hover:text-red-100" title="Delete">
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold text-gray-800 tracking-tight">Users</h1>
        <button onClick={handleCreate} className="products-violet-black-button px-5 py-2 text-sm rounded-full flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New User
        </button>
      </div>

      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Search by name, username or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="glass-input w-64"
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="glass-card rounded-2xl p-6">
          <DataTable columns={columns} data={paginatedUsers} />
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-400">Page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50">Previous</button>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      <UserFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchUsers} user={editingUser} />

      <ConfirmModal
        open={confirmOpen}
        title="Delete user"
        message={`Are you sure you want to delete "${userToDelete?.nombre} ${userToDelete?.apellido}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
        confirmButtonClassName="products-violet-black-button"
        cancelButtonClassName="products-violet-black-button"
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={1000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}