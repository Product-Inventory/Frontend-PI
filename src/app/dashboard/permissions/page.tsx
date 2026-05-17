"use client";

import { useEffect, useState } from "react";
import { permissionsService } from "@/services/permissions.service";
import { Permission } from "@/types/permissions";
import { Loading } from "@/components/ui/Loading";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Toast } from "@/components/ui/Toast";
import { Shield, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const itemsPerPage = 5;

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [form, setForm] = useState({
    code: "",
    nombre: "",
    modulo: "",
    descripcion: "",
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const data = await permissionsService.getAll();
      setPermissions(data.items);
    } catch (error) {
      setToast({ message: "Error loading permissions", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingPermission(null);
    setForm({ code: "", nombre: "", modulo: "", descripcion: "" });
    setIsModalOpen(true);
  };

  const openEdit = (perm: Permission) => {
    setEditingPermission(perm);
    setForm({
      code: perm.code,
      nombre: perm.nombre,
      modulo: perm.modulo,
      descripcion: perm.descripcion,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.nombre) {
      setToast({ message: "Code and Name are required", type: "error" });
      return;
    }

    try {
      setIsSaving(true);
      if (editingPermission) {
        await permissionsService.update(editingPermission.id, form);
        setToast({ message: "Permission updated", type: "success" });
      } else {
        await permissionsService.create(form);
        setToast({ message: "Permission created", type: "success" });
      }
      setIsModalOpen(false);
      fetchPermissions();
    } catch {
      setToast({ message: "Error saving permission", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!permissionToDelete) return;
    try {
      await permissionsService.delete(permissionToDelete.id);
      setToast({ message: "Permission deleted", type: "success" });
      fetchPermissions();
      setConfirmOpen(false);
    } catch {
      setToast({ message: "Error deleting permission", type: "error" });
    }
  };


  const totalPages = Math.ceil(permissions.length / itemsPerPage);
  const paginatedPermissions = permissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const buttonBase = "inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";
  const iconButtonBase = "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/35 products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";

  return (
    <div className="app-atmosphere relative min-h-full px-6 py-6 lg:px-10 rounded-3xl overflow-hidden">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-2xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Permissions</h1>
              <p className="mt-1 text-sm text-slate-600">Manage system access levels and modules.</p>
            </div>
          </div>
          <button onClick={openCreate} className={buttonBase}>
            <Plus className="mr-2 h-4 w-4" /> Create
          </button>
        </div>

        {isLoading ? (
          <Loading label="Loading permissions..." />
        ) : (
          <div className="glass-card overflow-hidden rounded-[40px]">

            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/25">
                  <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                    <th className="px-5 py-4">Code</th>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Module</th>
                    <th className="px-5 py-4">Description</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPermissions.map((p) => (
                    <tr key={p.id} className="border-t border-white/18 transition hover:bg-white/10">
                      <td className="px-5 py-5 font-extrabold text-slate-800">{p.code}</td>
                      <td className="px-5 py-5 font-semibold text-slate-800">{p.nombre}</td>
                      <td className="px-5 py-5 text-slate-700">
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                          {p.modulo}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-slate-600">{p.descripcion || "-"}</td>
                      <td className="px-5 py-5 text-center">
                        <div className="inline-flex gap-2">
                          <button onClick={() => openEdit(p)} className={iconButtonBase}>✏️</button>
                          <button 
                            onClick={() => { setPermissionToDelete(p); setConfirmOpen(true); }} 
                            className={iconButtonBase}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 md:hidden">
              {paginatedPermissions.map((p) => (
                <article key={p.id} className="rounded-3xl border border-white/45 bg-white/35 p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">CODE</p>
                      <p className="text-lg font-extrabold text-slate-900">{p.code}</p>
                    </div>
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">{p.modulo}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{p.nombre}</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openEdit(p)} className={`${buttonBase} flex-1`}>✏️ Edit</button>
                    <button 
                      onClick={() => { setPermissionToDelete(p); setConfirmOpen(true); }} 
                      className={iconButtonBase}
                    >
                      🗑️
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex justify-between items-center border-t border-white/20 px-5 py-4">
              <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-4 py-2 rounded-2xl border border-gray-200 bg-white products-violet-black-button disabled:opacity-20"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-4 py-2 rounded-2xl border border-gray-200 bg-white products-violet-black-button disabled:opacity-20"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="app-modal-overlay app-modal-overlay--padded">
          <div className="app-modal-shell app-modal-shell--md glass-card p-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
              {editingPermission ? "Edit Permission" : "New Permission"}
            </h2>
            <div className="grid gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
                Code
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="glass-input w-full"
                  placeholder="e.g. AUTH_USER_CREATE"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
                Name
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="glass-input w-full"
                  placeholder="e.g. Create Users"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
                Module
                <input
                  value={form.modulo}
                  onChange={(e) => setForm({ ...form, modulo: e.target.value })}
                  className="glass-input w-full"
                  placeholder="e.g. Security"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
                Description
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="glass-input w-full min-h-[100px]"
                  placeholder="Optional details..."
                />
              </label>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 font-semibold text-slate-600 products-violet-black-button">Cancel</button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50 products-violet-black-button"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Delete Permission"
        message={`Are you sure you want to delete "${permissionToDelete?.code}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}