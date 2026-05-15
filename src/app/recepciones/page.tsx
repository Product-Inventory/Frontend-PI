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
=======
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Loading } from "@/components/ui/Loading";
import { Toast } from "@/components/ui/Toast";
import { receptionsService } from "@/services/receptions.service";
import type { Reception, ReceptionFormValues, ReceptionStatus } from "@/types/reception";
import { ClipboardList, Plus, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";

type StatusFilter = "all" | ReceptionStatus;

const itemsPerPage = 10;

const emptyForm: ReceptionFormValues = {
  supplierId: "",
  fecha: "",
  folio: "",
  comentarios: "",
  items: []
};

export default function ReceptionsPage() {
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReception, setEditingReception] = useState<Reception | null>(null);
  const [form, setForm] = useState<ReceptionFormValues>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [receptionToDelete, setReceptionToDelete] = useState<Reception | null>(null);

  const showPagination = totalItems > itemsPerPage;

  const buildQuery = () => {
    const query: Record<string, string | number> = {
      page: currentPage,
      limit: itemsPerPage,
    };
    const trimmedSearch = search.trim();
    if (trimmedSearch) query.q = trimmedSearch;
    if (statusFilter === "DRAFT" || statusFilter === "CONFIRMED") query.status = statusFilter;
    return query;
  };

  const fetchReceptions = async () => {
    try {
      setIsLoading(true);
      const data = await receptionsService.getAll(buildQuery());
      const items = data.items || [];
      setReceptions(items);
      setTotalItems(data.total || 0);
      setTotalPages(Math.max(1, Math.ceil((data.total || 0) / (data.limit || itemsPerPage))));

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

    const timer = window.setTimeout(() => {
      void fetchReceptions();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search, statusFilter, currentPage]);
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);
  useEffect(() => { setCurrentPage((page) => Math.min(page, totalPages)); }, [totalPages]);

  // Validación mínima para crear una recepción
  const validateForm = () => {
    if (!form.supplierId) return "Supplier is required";
    if (!form.fecha) return "Date is required";
    if (!form.folio) return "Folio is required";
    if (!form.items || !form.items.length) return "At least one item is required";
    return "";
  };

  const openCreate = () => {
    setEditingReception(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (rec: Reception) => {
    setEditingReception(rec);
    setForm({
      supplierId: rec.supplierId,
      fecha: rec.fecha,
      folio: rec.folio,
      comentarios: rec.comentarios,
      items: rec.items.map((item) => ({
        productId: item.productId,
        cantidad: item.cantidad,
        costoUnitario: item.costoUnitario,
      })),
    });
    setIsModalOpen(true);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      setToast({ message: error, type: "error" });
      return;
    }
    try {
      setIsSaving(true);
      if (editingReception) {
        await receptionsService.update(editingReception.id, form);
        setToast({ message: "Reception updated successfully", type: "success" });
      } else {
        await receptionsService.create(form);
        setToast({ message: "Reception created successfully", type: "success" });
      }
      setIsModalOpen(false);
      setEditingReception(null);
      setForm(emptyForm);
      await fetchReceptions();
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error saving reception", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirm = async (rec: Reception) => {
    try {
      setIsSaving(true);
      await receptionsService.confirm(rec.id);
      setToast({ message: "Reception confirmed successfully", type: "success" });
      await fetchReceptions();
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error confirming reception", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!receptionToDelete) return;
    try {
      await receptionsService.delete(receptionToDelete.id);
      setToast({ message: "Reception deleted successfully", type: "success" });
      setConfirmOpen(false);
      setReceptionToDelete(null);
      await fetchReceptions();

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

  const buttonBase = "inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-sm font-semibold !text-[#9a7ef0] shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";

  return (
    <div className="app-atmosphere min-h-full px-6 py-6 lg:px-10">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6">
        {toast && (
          <Toast message={toast.message} type={toast.type} duration={3000} onClose={() => setToast(null)} />
        )}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-md flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                Receptions
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Inventory receipts registry.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:min-w-[31rem]">
            <div className="flex items-center justify-between gap-3">
              <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                Total: {totalItems}
              </span>
              <button onClick={openCreate} className={buttonBase}>
                <Plus className="mr-2 h-4 w-4" />
                Create
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Loading label="Loading receptions..." />
        ) : (
          <div className="glass-card overflow-hidden rounded-[30px]">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-white/25">
                  <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                    <th className="px-5 py-4">Folio</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Supplier</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Items</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receptions.length > 0 ? (
                    receptions.map((rec) => (
                      <tr key={rec.id} className="border-t border-white/18 transition hover:bg-white/10">
                        <td className="px-5 py-5 font-extrabold text-slate-800">{rec.folio}</td>
                        <td className="px-5 py-5 text-slate-700">{rec.fecha}</td>
                        <td className="px-5 py-5 text-slate-700">{rec.supplierNombre}</td>
                        <td className="px-5 py-5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${rec.status === "CONFIRMED" ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"}`}>
                            {rec.status === "CONFIRMED" ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-5 py-5">{rec.items.length}</td>
                        <td className="px-5 py-5 font-semibold text-slate-800">${rec.total.toLocaleString()}</td>
                        <td className="px-5 py-5 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button onClick={() => openEdit(rec)} className={buttonBase} title="Edit" aria-label="Edit reception" disabled={rec.status === "CONFIRMED"}>✏️</button>
                            <button onClick={() => handleConfirm(rec)} className={buttonBase} disabled={rec.status === "CONFIRMED"}>
                              Confirm
                            </button>
                            <button
                              onClick={() => { setReceptionToDelete(rec); setConfirmOpen(true); }}
                              className={buttonBase}
                              disabled={rec.status === "CONFIRMED"}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center text-slate-500">
                        No receptions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Móvil: cards simples */}
            <div className="grid gap-4 p-4 md:hidden">
              {receptions.length > 0 ? (
                receptions.map((rec) => (
                  <article
                    key={rec.id}
                    className="rounded-[24px] border border-white/45 bg-white/35 p-4 shadow-[0_8px_20px_rgba(138,108,198,0.12)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase mb-1 text-slate-500">Folio</p>
                        <p className="truncate font-extrabold text-slate-900">{rec.folio}</p>
                        <p className="text-sm text-slate-700">{rec.supplierNombre}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${rec.status === "CONFIRMED" ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"}`}>
                        {rec.status}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                      <ReceptionMeta label="Date" value={rec.fecha} />
                      <ReceptionMeta label="Items" value={String(rec.items.length)} />
                      <ReceptionMeta label="Total" value={`$${rec.total.toLocaleString()}`} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => openEdit(rec)} className={buttonBase} disabled={rec.status === "CONFIRMED"}>✏️</button>
                      <button onClick={() => handleConfirm(rec)} className={buttonBase} disabled={rec.status === "CONFIRMED"}>Confirm</button>
                      <button onClick={() => { setReceptionToDelete(rec); setConfirmOpen(true); }} className={buttonBase} disabled={rec.status === "CONFIRMED"}>🗑️</button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/45 bg-white/35 px-4 py-10 text-center text-slate-500">
                  No receptions found
                </div>
              )}
            </div>
            {/* Paginación */}
            <div className="flex justify-between items-center mt-4 border-t border-white/20 px-5 pt-4">
              <p className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={!showPagination || currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm !text-[#9a7ef0] disabled:opacity-20"
                >Previous</button>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                  disabled={!showPagination || currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm !text-[#9a7ef0] disabled:opacity-20"
                >Next</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CREAR/EDITAR */}
        {isModalOpen && (
          <div className="app-modal-overlay app-modal-overlay--padded">
            <div className="app-modal-shell app-modal-shell--lg glass-card rounded-[28px] p-6 md:p-8">
              <div className="mb-5">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {editingReception ? "Edit Reception" : "New Reception"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {editingReception
                    ? "Modify the folio, date, supplier, items, or comments."
                    : "Register a new inventory reception."}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ReceptionInput label="Folio">
                  <input name="folio" value={form.folio} onChange={handleChange} className="glass-input w-full" placeholder="Folio" />
                </ReceptionInput>
                <ReceptionInput label="Fecha">
                  <input name="fecha" type="date" value={form.fecha} onChange={handleChange} className="glass-input w-full" />
                </ReceptionInput>
                <ReceptionInput label="Supplier ID">
                  <input name="supplierId" value={form.supplierId} onChange={handleChange} className="glass-input w-full" placeholder="Supplier ID" />
                </ReceptionInput>
                <ReceptionInput label="Comments">
                  <input name="comentarios" value={form.comentarios ?? ""} onChange={handleChange} className="glass-input w-full" placeholder="Comments" />
                </ReceptionInput>
                <div className="md:col-span-2">
                  <ReceptionInput label="Items">
                    {/* Aquí deberías poner tu componente de items, lista simple o lo que uses. 
                        Por cuestiones de ejemplo solo muestra cuántos items.
                    */}
                    <p>{form.items.length} item(s) (add items UI here)</p>
                  </ReceptionInput>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className={buttonBase}>Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold !text-[#9a7ef0] shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          open={confirmOpen}
          title="Delete reception"
          message={`Do you want to delete the reception "${receptionToDelete?.folio || ""}"?`}
          onConfirm={() => void handleDelete()}
          onCancel={() => {
            setConfirmOpen(false);
            setReceptionToDelete(null);
          }}
        />
      </div>
    </div>
  );
}

function ReceptionInput({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800 mb-2">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ReceptionMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/25 px-3 py-2">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>

    </div>
  );
}