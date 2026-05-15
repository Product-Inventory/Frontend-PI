"use client";

import { useEffect, useState } from "react";
import { receptionsService } from "@/services/receptions.service";
import { Reception } from "@/types/reception";
import Loading from "@/components/ui/Loading";
import ConfirmModal from "@/components/ui/ConfirmModal";
import RecepcionFormModal from "@/components/forms/ReceptionFormModal";
import Link from "next/link";
import { Toast } from "@/components/ui/Toast";
import { Search, Eye, Pencil, CheckCircle, Trash2, Plus } from "lucide-react";

export default function RecepcionesPage() {
  const [recepciones, setRecepciones] = useState<Reception[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "DRAFT" | "CONFIRMED">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecepcion, setEditingRecepcion] = useState<Reception | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [recepcionToDelete, setRecepcionToDelete] = useState<Reception | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const itemsPerPage = 5;

  const fetchRecepciones = async () => {
    try {
      setIsLoading(true);
      const data = await receptionsService.getAll({
        q: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        page: currentPage,
        limit: itemsPerPage,
      });
      setRecepciones(data.items);
      setTotalItems(data.total);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error loading receptions", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecepciones();
  }, [search, statusFilter, currentPage]);

  const handleCreate = () => {
    setEditingRecepcion(null);
    setModalOpen(true);
  };

  const handleEdit = (recepcion: Reception) => {
    if (recepcion.status === "CONFIRMED") {
      setToast({ message: "Cannot edit a confirmed reception", type: "error" });
      return;
    }
    setEditingRecepcion(recepcion);
    setModalOpen(true);
  };

  const handleConfirm = async (id: string) => {
    if (!confirm("Confirm this reception? Stock will be updated.")) return;
    setConfirmingId(id);
    try {
      await receptionsService.confirm(id);
      setToast({ message: "Reception confirmed successfully", type: "success" });
      fetchRecepciones();
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error confirming reception", type: "error" });
    } finally {
      setConfirmingId(null);
    }
  };

  const handleDelete = (recepcion: Reception) => {
    if (recepcion.status === "CONFIRMED") {
      setToast({ message: "Cannot delete a confirmed reception", type: "error" });
      return;
    }
    setRecepcionToDelete(recepcion);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!recepcionToDelete) return;
    try {
      await receptionsService.delete(recepcionToDelete.id);
      setToast({ message: "Reception deleted successfully", type: "success" });
      fetchRecepciones();
      setConfirmOpen(false);
      setRecepcionToDelete(null);
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error deleting reception", type: "error" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold text-gray-800 tracking-tight">Receptions</h1>
        <button onClick={handleCreate} className="products-violet-black-button px-5 py-2 text-sm rounded-full flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Reception
        </button>
      </div>

      <div className="flex gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by folio or supplier..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="glass-input w-64 pl-9"
          />
        </div>
        <select
          className="glass-input w-48"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as typeof statusFilter);
            setCurrentPage(1);
          }}
        >
          <option value="all">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
        </select>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="glass-card rounded-2xl p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/10">
                <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                  <th className="px-5 py-4">Folio</th>
                  <th className="px-5 py-4">Supplier</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Total</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-right w-48">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recepciones.length > 0 ? (
                  recepciones.map((row) => (
                    <tr key={row.id} className="border-t border-white/18 hover:bg-white/5 transition">
                      <td className="px-5 py-5 font-semibold">{row.folio}</td>
                      <td className="px-5 py-5">{row.supplierNombre}</td>
                      <td className="px-5 py-5">{new Date(row.fecha).toLocaleDateString()}</td>
                      <td className="px-5 py-5 text-right font-semibold">${row.total.toFixed(2)}</td>
                      <td className="px-5 py-5 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "CONFIRMED" ? "bg-green-400/30 text-green-100" : "bg-yellow-400/30 text-yellow-100"}`}>
                          {row.status === "CONFIRMED" ? "Confirmed" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/recepciones/${row.id}`} className="text-blue-200 hover:text-blue-100" title="View details">
                            <Eye className="h-4 w-4" />
                          </Link>
                          {row.status === "DRAFT" && (
                            <>
                              <button onClick={() => handleEdit(row)} className="text-yellow-200 hover:text-yellow-100" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleConfirm(row.id)} disabled={confirmingId === row.id} className="text-green-200 hover:text-green-100 flex items-center gap-1" title="Confirm">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-xs">Confirm</span>
                              </button>
                              <button onClick={() => handleDelete(row)} className="text-red-200 hover:text-red-100" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-slate-500">
                      No receptions registered
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-400">Page {currentPage} of {totalPages} ({totalItems} records)</p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50">Previous</button>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      <RecepcionFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchRecepciones} recepcion={editingRecepcion} />
      <ConfirmModal
        open={confirmOpen}
        title="Delete reception"
        message={`Are you sure you want to delete reception "${recepcionToDelete?.folio}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
        confirmButtonClassName="products-violet-black-button"
        cancelButtonClassName="products-violet-black-button"
      />
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
    </div>
  );
}