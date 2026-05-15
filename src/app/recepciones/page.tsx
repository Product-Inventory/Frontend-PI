"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { receptionsService } from "@/services/receptions.service";
import type { Reception, ReceptionFormValues } from "@/types/reception";
import type { ReceptionStatus } from "@/types/reception";
import { Loading } from "@/components/ui/Loading";
import ConfirmModal from "@/components/ui/ConfirmModal";

import { Toast } from "@/components/ui/Toast";
import { ClipboardList, Plus, CheckCircle, XCircle, Search, Eye, Pencil, Trash2 } from "lucide-react";

type StatusFilter = "all" | ReceptionStatus;

const itemsPerPage = 10;
const CONFIRMED_STATUS: ReceptionStatus = "CONFIRMED" as const;
const DRAFT_STATUS: ReceptionStatus = "DRAFT" as const;

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
    const timer = window.setTimeout(() => {
      void fetchReceptions();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, statusFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

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
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${rec.status === CONFIRMED_STATUS ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"}`}>
                            {rec.status === CONFIRMED_STATUS ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-5 py-5">{rec.items.length}</td>
                        <td className="px-5 py-5 font-semibold text-slate-800">${rec.total.toLocaleString()}</td>
                        <td className="px-5 py-5 text-center">
                          <div className="inline-flex items-center gap-2">
                            <Link href={`/recepciones/${rec.id}`} className="text-blue-200 hover:text-blue-100" title="View details">
                              <Eye className="h-4 w-4" />
                            </Link>
                            {rec.status === DRAFT_STATUS && (
                              <>
                                <button
                                  onClick={() => openEdit(rec)}
                                  className={buttonBase}
                                  disabled={rec.status === CONFIRMED_STATUS}
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleConfirm(rec)}
                                  className={buttonBase}
                                  disabled={rec.status === CONFIRMED_STATUS}
                                  title="Confirm"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => {
                                    setReceptionToDelete(rec);
                                    setConfirmOpen(true);
                                  }}
                                  className={buttonBase}
                                  disabled={rec.status === CONFIRMED_STATUS}
                                  title="Delete"
                                >
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
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${rec.status === CONFIRMED_STATUS ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"}`}>
                        {rec.status}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                      <ReceptionMeta label="Date" value={rec.fecha} />
                      <ReceptionMeta label="Items" value={String(rec.items.length)} />
                      <ReceptionMeta label="Total" value={`$${rec.total.toLocaleString()}`} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/recepciones/${rec.id}`} className={buttonBase}>
                        👁️
                      </Link>
                      {rec.status === DRAFT_STATUS && (
                        <>
                          <button onClick={() => openEdit(rec)} className={buttonBase} disabled={rec.status === CONFIRMED_STATUS}>
                            ✏️
                          </button>
                          <button onClick={() => handleConfirm(rec)} className={buttonBase} disabled={rec.status === CONFIRMED_STATUS}>
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setReceptionToDelete(rec);
                              setConfirmOpen(true);
                            }}
                            className={buttonBase}
                            disabled={rec.status === CONFIRMED_STATUS}
                          >
                            🗑️
                          </button>
                        </>
                      )}
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
            {showPagination && (
              <div className="flex justify-between items-center mt-4 border-t border-white/20 px-5 pt-4">
                <p className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm products-violet-black-button disabled:opacity-20"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
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
                <ReceptionInput label="Folio *">
                  <input
                    name="folio"
                    value={form.folio}
                    onChange={handleChange}
                    className="glass-input w-full"
                    placeholder="Folio"
                  />
                </ReceptionInput>
                <ReceptionInput label="Date *">
                  <input
                    name="fecha"
                    type="date"
                    value={form.fecha}
                    onChange={handleChange}
                    className="glass-input w-full"
                  />
                </ReceptionInput>
                <ReceptionInput label="Supplier ID *">
                  <input
                    name="supplierId"
                    value={form.supplierId}
                    onChange={handleChange}
                    className="glass-input w-full"
                    placeholder="Supplier ID"
                  />
                </ReceptionInput>
                <ReceptionInput label="Comments">
                  <input
                    name="comentarios"
                    value={form.comentarios ?? ""}
                    onChange={handleChange}
                    className="glass-input w-full"
                    placeholder="Comments"
                  />
                </ReceptionInput>
                <div className="md:col-span-2">
                  <ReceptionInput label="Items *">
                    <p className="text-sm text-slate-600">{form.items.length} item(s)</p>
                  </ReceptionInput>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={buttonBase}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold products-violet-black-button shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
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
          confirmButtonClassName="products-violet-black-button"
          cancelButtonClassName="products-violet-black-button"
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
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    
    </div>
  );
}
