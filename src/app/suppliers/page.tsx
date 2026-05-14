"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { suppliersService } from "@/services/suppliers.service";
import { Supplier } from "@/types/supplier";
import Loading from "@/components/ui/Loading";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SupplierFormModal from "@/components/forms/SupplierFormModal";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const data = await suppliersService.getAll();
      setSuppliers(data.items);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (supplier: Supplier) => {
    try {
      await suppliersService.toggleActive(supplier.id, !supplier.activo);
      fetchSuppliers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al cambiar estado");
    }
  };

  const handleDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;
    try {
      await suppliersService.delete(supplierToDelete.id);
      fetchSuppliers();
      setConfirmOpen(false);
      setSupplierToDelete(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al eliminar proveedor");
    }
  };

  // Filtro local
  const filteredSuppliers = suppliers.filter((s) => {
    const searchLower = search.toLowerCase();
    return (
      s.nombre.toLowerCase().includes(searchLower) ||
      (s.rfc && s.rfc.toLowerCase().includes(searchLower)) ||
      (s.contacto && s.contacto.toLowerCase().includes(searchLower)) ||
      (s.email && s.email.toLowerCase().includes(searchLower))
    );
  });

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  const columns = [
    { header: "Nombre", accessor: "nombre" as const },
    { header: "RFC", accessor: "rfc" as const, render: (row: Supplier) => row.rfc || "-" },
    { header: "Contacto", accessor: "contacto" as const, render: (row: Supplier) => row.contacto || "-" },
    { header: "Email", accessor: "email" as const, render: (row: Supplier) => row.email || "-" },
    { header: "Teléfono", accessor: "telefono" as const, render: (row: Supplier) => row.telefono || "-" },
    {
      header: "Estado",
      accessor: "activo" as const,
      render: (row: Supplier) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.activo ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}>
          {row.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "",
      render: (row: Supplier) => (
        <div className="flex gap-2 justify-end">
          <button onClick={() => handleEdit(row)} className="btn btn-ghost btn-xs opacity-70 hover:opacity-100" title="Editar">✏️</button>
          <button onClick={() => handleToggleActive(row)} className="btn btn-ghost btn-xs opacity-70 hover:opacity-100" title={row.activo ? "Desactivar" : "Activar"}>
            {row.activo ? "🔇" : "🔁"}
          </button>
          <button onClick={() => handleDelete(row)} className="btn btn-ghost btn-xs opacity-70 hover:opacity-100 text-red-500" title="Eliminar">🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold text-gray-800 tracking-tight">Proveedores</h1>
        <button onClick={handleCreate} className="px-5 py-2 text-sm bg-white/20 backdrop-blur-sm border border-white/40 rounded-full shadow-md hover:bg-white/30 transition">
          + Nuevo Proveedor
        </button>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="glass-card rounded-2xl p-6">
          <DataTable columns={columns} data={paginatedSuppliers} />
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-400">Página {currentPage} de {totalPages || 1}</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50">Previous</button>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      )}

      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSuppliers}
        supplier={editingSupplier}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Eliminar proveedor"
        message={`¿Deseas eliminar al proveedor "${supplierToDelete?.nombre}"?`}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setSupplierToDelete(null); }}
      />
    </div>
  );
}