"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { receptionsService } from "@/services/receptions.service";
import { Reception } from "@/types/reception";
import Loading from "@/components/ui/Loading";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ReceptionFormModal from "@/components/forms/ReceptionFormModal";
import Link from "next/link";
import { Search, Eye, Pencil, CheckCircle, Trash2, Plus } from "lucide-react";

export default function ReceptionsPage() {
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "DRAFT" | "CONFIRMED">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReception, setEditingReception] = useState<Reception | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [receptionToDelete, setReceptionToDelete] = useState<Reception | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const itemsPerPage = 5;

  const fetchReceptions = async () => {
    try {
      setIsLoading(true);
      const data = await receptionsService.getAll({
        q: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        page: currentPage,
        limit: itemsPerPage,
      });
      setReceptions(data.items);
      setTotalItems(data.total);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptions();
  }, [search, statusFilter, currentPage]);

  const handleCreate = () => {
    setEditingReception(null);
    setModalOpen(true);
  };

  const handleEdit = (reception: Reception) => {
    if (reception.status === "CONFIRMED") {
      alert("Cannot edit a confirmed reception");
      return;
    }
    setEditingReception(reception);
    setModalOpen(true);
  };

  const handleConfirm = async (id: string) => {
    if (!confirm("Confirm this reception? Inventory will be updated.")) return;
    setConfirmingId(id);
    try {
      await receptionsService.confirm(id);
      fetchReceptions();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error confirming");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleDelete = (reception: Reception) => {
    if (reception.status === "CONFIRMED") {
      alert("Cannot delete a confirmed reception");
      return;
    }
    setReceptionToDelete(reception);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!receptionToDelete) return;
    try {
      await receptionsService.delete(receptionToDelete.id);
      fetchReceptions();
      setConfirmOpen(false);
      setReceptionToDelete(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error deleting");
    }
  };

  const columns = [
    { header: "Folio", accessor: "folio" as const },
    { header: "Supplier", accessor: "supplierNombre" as const },
    {
      header: "Date",
      accessor: "fecha" as const,
      render: (row: Reception) => new Date(row.fecha).toLocaleDateString(),
    },
    {
      header: "Total",
      accessor: "total" as const,
      render: (row: Reception) => `$${row.total.toFixed(2)}`,
    },
    {
      header: "Status",
      accessor: "status" as const,
      render: (row: Reception) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "CONFIRMED"
              ? "bg-green-400/30 text-green-100"
              : "bg-yellow-400/30 text-yellow-100"
          }`}
        >
          {row.status === "CONFIRMED" ? "Confirmed" : "Draft"}
        </span>
      ),
    },
    {
      header: "",
      render: (row: Reception) => (
        <div className="flex gap-2 justify-end">
          <Link href={`/receptions/${row.id}`} className="text-blue-200 hover:text-blue-100" title="View details">
            <Eye className="h-4 w-4" />
          </Link>
          {row.status === "DRAFT" && (
            <>
              <button onClick={() => handleEdit(row)} className="text-yellow-200 hover:text-yellow-100" title="Edit">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => handleConfirm(row.id)} disabled={confirmingId === row.id} className="text-green-200 hover:text-green-100" title="Confirm">
                <CheckCircle className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(row)} className="text-red-200 hover:text-red-100" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold text-gray-800 tracking-tight">Receptions</h1>
        <button
          onClick={handleCreate}
          className="px-5 py-2 text-sm bg-white/20 backdrop-blur-sm border border-white/40 rounded-full shadow-md hover:bg-white/30 transition inline-flex items-center gap-2"
        >
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
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
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
          <DataTable columns={columns} data={receptions} />
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-400">
                Page {currentPage} of {totalPages} ({totalItems} records)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ReceptionFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchReceptions}
        reception={editingReception}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Delete reception"
        message={`Delete reception ${receptionToDelete?.folio}?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}