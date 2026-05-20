"use client";

import { useEffect, useState } from "react";
import { suppliersService } from "@/services/suppliers.service";
import { Supplier } from "@/types/supplier";
import Loading from "@/components/ui/Loading";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SupplierFormModal from "@/components/forms/SupplierFormModal";
import { Toast } from "@/components/ui/Toast";
import { Plus, Power } from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const itemsPerPage = 5;

  const fetchSuppliers = async () => {
    try {
      const data = await suppliersService.getAll();
      setSuppliers(data.items);
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error loading suppliers", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreate = () => {
    setEditingSupplier(null);
    setModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setModalOpen(true);
  };

  const handleToggleActive = async (supplier: Supplier) => {
    try {
      await suppliersService.toggleActive(supplier.id, !supplier.activo);
      setToast({ message: `Supplier ${supplier.activo ? "deactivated" : "activated"} successfully`, type: "success" });
      fetchSuppliers();
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error toggling status", type: "error" });
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
      setToast({ message: "Supplier deleted successfully", type: "success" });
      fetchSuppliers();
      setConfirmOpen(false);
      setSupplierToDelete(null);
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error deleting supplier", type: "error" });
    }
  };

  // Filtro local
  const filteredSuppliers = suppliers.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.nombre.toLowerCase().includes(term) ||
      (s.rfc && s.rfc.toLowerCase().includes(term)) ||
      (s.contacto && s.contacto.toLowerCase().includes(term)) ||
      (s.email && s.email.toLowerCase().includes(term))
    );
  });

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold text-gray-800 tracking-tight">Suppliers</h1>
        <button onClick={handleCreate} className="products-violet-black-button px-5 py-2 text-sm rounded-full flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Supplier
        </button>
      </div>


      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Search by name, RFC, contact or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="glass-input w-64"
        />
      </div>



      {isLoading ? (
        <Loading />
      ) : (
        <div className="glass-card rounded-2xl p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/10">
                <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                  <th className="px-5 py-4">Company</th>
                  <th className="px-5 py-4">RFC</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-right w-48">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSuppliers.length > 0 ? (
                  paginatedSuppliers.map((row) => (
                    <tr key={row.id} className="border-t border-white/18 hover:bg-white/5 transition">
                      <td className="px-5 py-5 font-semibold">{row.nombre}</td>
                      <td className="px-5 py-5">{row.rfc || "-"}</td>
                      <td className="px-5 py-5">{row.contacto || "-"}</td>
                      <td className="px-5 py-5">{row.email || "-"}</td>
                      <td className="px-5 py-5">{row.telefono || "-"}</td>
                      <td className="px-5 py-5 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.activo ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}>
                          {row.activo ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-right">
                        <div className="flex justify-end gap-2">
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-slate-500">
                      No suppliers registered
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

      <SupplierFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchSuppliers} supplier={editingSupplier} />

      <ConfirmModal
        open={confirmOpen}
        title="Delete supplier"
        message={`Are you sure you want to delete "${supplierToDelete?.nombre}"?`}
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