"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { permissionsService } from "@/services/permissions.service";
import { Permission } from "@/types/permissions";

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  const [form, setForm] = useState({
    code: "",
    nombre: "",
    modulo: "",
    descripcion: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const data = await permissionsService.getAll();
      setPermissions(data.items);
    } catch (error) {
      console.error("Error al cargar permisos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // CREATE
  const openCreate = () => {
    setEditingPermission(null);
    setForm({
      code: "",
      nombre: "",
      modulo: "",
      descripcion: "",
    });
    setIsModalOpen(true);
  };

  // EDIT
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

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (editingPermission) {
        await permissionsService.update(editingPermission.id, form);
      } else {
        await permissionsService.create(form);
      }

      setIsModalOpen(false);
      fetchPermissions();

    } catch {
      alert("Error al guardar");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este permiso?")) return;

    try {
      await permissionsService.delete(id);
      fetchPermissions();
    } catch {
      alert("Error al eliminar");
    }
  };

  // FILTER
  const filteredPermissions = permissions.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.nombre.toLowerCase().includes(search.toLowerCase());

    const matchesModule =
      moduleFilter === "all" || p.modulo === moduleFilter;

    return matchesSearch && matchesModule;
  });

  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedPermissions = filteredPermissions.slice(
    startIndex,
    endIndex
  );

  const modules = [
    "all",
    ...Array.from(new Set(permissions.map((p) => p.modulo))),
  ];

  const columns = [
    { header: "Código", accessor: "code" as const },
    { header: "Nombre", accessor: "nombre" as const },
    { header: "Módulo", accessor: "modulo" as const },
    { header: "Descripción", accessor: "descripcion" as const },
    {
      header: "",
      render: (row: Permission) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => openEdit(row)}
            className="btn btn-ghost btn-xs opacity-70 hover:opacity-100"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="btn btn-ghost btn-xs opacity-70 hover:opacity-100 text-red-500"
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
          Permissions
        </h1>

        <button
          onClick={openCreate}
          className="px-5 py-2 text-sm"
        >
          + Create
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input w-72"
        />

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="glass-input"
        >
          {modules.map((m) => (
            <option key={m} value={m}>
              {m === "all" ? "All" : m}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="p-10 text-center">Cargando...</div>
      ) : (
        <div className="glass-card rounded-2xl p-6">
          <DataTable columns={columns} data={paginatedPermissions} />
          <div className="flex justify-between items-center mt-4">

            <p className="text-sm text-gray-400">
              Página {currentPage} de {totalPages}
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50"
              >
                Next
              </button>

            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-6 w-96">

            <h2 className="text-xl font-semibold text-white mb-4">
              {editingPermission ? "Edit Permission" : "New Permission"}
            </h2>

            <div className="flex flex-col gap-3">

              <input
                name="code"
                placeholder="Code"
                value={form.code}
                onChange={handleChange}
                className="glass-input w-full"
              />

              <input
                name="nombre"
                placeholder="Name"
                value={form.nombre}
                onChange={handleChange}
                className="glass-input w-full"
              />

              <input
                name="modulo"
                placeholder="Module"
                value={form.modulo}
                onChange={handleChange}
                className="glass-input w-full"
              />

              <textarea
                name="descripcion"
                placeholder="Description"
                value={form.descripcion}
                onChange={handleChange}
                className="glass-input w-full"
              />

            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}