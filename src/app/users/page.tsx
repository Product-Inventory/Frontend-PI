"use client";

import { useEffect, useState } from "react";
import { usersService } from "@/services/users.service";
import { User } from "@/types/user";
import { Loading } from "@/components/ui/Loading";
import ConfirmModal from "@/components/ui/ConfirmModal";
import UserFormModal from "@/components/forms/UserFormModal";
import { Toast } from "@/components/ui/Toast";
import { Plus, Power } from "lucide-react";

import { Users, Plus, Pencil, Power, Trash2, Search } from "lucide-react";

const itemsPerPage = 5;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await usersService.getAll();
      setUsers(data.items || []);
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

  // Filtro local con búsqueda y estado
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.nombre} ${u.apellido}`.toLowerCase();
    const term = search.toLowerCase();
    const matchesSearch =
      fullName.includes(term) ||
      u.usuario.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term);
    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = u.activo === true;
    if (statusFilter === "inactive") matchesStatus = u.activo === false;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const showPagination = filteredUsers.length > itemsPerPage;

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
  const buttonBase = "inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";

  return (
    <div className="app-atmosphere min-h-full px-6 py-6 lg:px-10">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={3000}
            onClose={() => setToast(null)}
            portal={false}
            overlayClassName="app-alert-overlay--module"
          />
        )}

        {/* HEADER */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-md flex items-center justify-center">
              <Users className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                Users
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage system users and their roles.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:min-w-[31rem]">
            <div className="flex items-center justify-between gap-3">
              <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                Total: {users.length}
              </span>
              <button onClick={handleCreate} className={buttonBase}>
                <Plus className="mr-2 h-4 w-4" />
                Create
              </button>
            </div>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTROS (grid 50/50) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2 sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input w-full pl-9"
              />
            </div>
            <button onClick={() => setSearch("")} className="whitespace-nowrap">
              Clear filter
            </button>
          </div>
          <div className="flex justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              className="glass-input w-full sm:w-auto"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
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

        {isLoading ? (
          <Loading label="Loading users..." />
        ) : (
          <div className="glass-card overflow-hidden rounded-[30px]">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-white/25">
                  <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Username</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-center w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="border-t border-white/18 transition hover:bg-white/10">
                        <td className="px-5 py-5 font-semibold text-slate-800">
                          {user.nombre} {user.apellido}
                        </td>
                        <td className="px-5 py-5 text-slate-700">{user.usuario}</td>
                        <td className="px-5 py-5 text-slate-700">{user.email}</td>
                        <td className="px-5 py-5 text-slate-700">
                          {user.role || (user.roleId === 'role_admin' ? 'Admin' : user.roleId === 'role_user' ? 'User' : '-')}
                        </td>
                        <td className="px-5 py-5 text-center">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${user.activo ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"}`}>
                            {user.activo ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button onClick={() => handleEdit(user)} className={buttonBase} title="Edit">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleToggleActive(user)} className={buttonBase} title={user.activo ? "Deactivate" : "Activate"}>
                              <Power className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(user)} className={buttonBase} title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center text-slate-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Versión móvil (cards) */}
            <div className="grid gap-4 p-4 md:hidden">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <article key={user.id} className="rounded-[24px] border border-white/45 bg-white/35 p-4 shadow-[0_8px_20px_rgba(138,108,198,0.12)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase mb-1 text-slate-500">Name</p>
                        <p className="truncate font-extrabold text-slate-900">{user.nombre} {user.apellido}</p>
                        <p className="text-sm text-slate-700">{user.usuario}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${user.activo ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"}`}>
                        {user.activo ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                      <UserMeta label="Email" value={user.email} />
                      <UserMeta label="Role" value={user.role || (user.roleId === 'role_admin' ? 'Admin' : 'User')} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => handleEdit(user)} className={buttonBase}>✏️</button>
                      <button onClick={() => handleToggleActive(user)} className={buttonBase}>{user.activo ? "Off" : "On"}</button>
                      <button onClick={() => handleDelete(user)} className={buttonBase}>🗑️</button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/45 bg-white/35 px-4 py-10 text-center text-slate-500">
                  No users found
                </div>
              )}
            </div>

            {/* Paginación */}
            {showPagination && (
              <div className="flex justify-between items-center mt-4 border-t border-white/20 px-5 pt-4">
                <p className="text-sm text-gray-400">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm products-violet-black-button disabled:opacity-20"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm products-violet-black-button disabled:opacity-20"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <UserFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchUsers}
          user={editingUser}
        />

        <ConfirmModal
          open={confirmOpen}
          title="Delete user"
          message={`Are you sure you want to delete "${userToDelete?.nombre} ${userToDelete?.apellido}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)}
          confirmButtonClassName="products-violet-black-button"
          cancelButtonClassName="products-violet-black-button"
        />
      </div>
    </div>
  );
}

function UserMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/25 px-3 py-2">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}