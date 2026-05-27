"use client";

import { useEffect, useState } from "react";
import { receptionsService } from "@/services/receptions.service";
import { Reception } from "@/types/reception";
import { Loading } from "@/components/ui/Loading";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ReceptionFormModal from "@/components/forms/ReceptionFormModal";
import { Toast } from "@/components/ui/Toast";
import { Portal } from "@/components/ui/Portal";
import { ClipboardList, Plus, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { canAccessRoute, getDefaultRoute, getRouteByPath } from "@/routes/routeConfig";
import { usePathname, useRouter } from "next/navigation";

const itemsPerPage = 5;

export default function ReceptionsPage() {
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "DRAFT" | "CONFIRMED">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReception, setEditingReception] = useState<Reception | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [receptionToDelete, setReceptionToDelete] = useState<Reception | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [viewingReception, setViewingReception] = useState<Reception | null>(null);
  const [confirmReceptionOpen, setConfirmReceptionOpen] = useState(false);
  const [receptionToConfirm, setReceptionToConfirm] = useState<string | null>(null);

  const { user, isLoading: isAuthLoading, isHydrated } = useAuth();  const pathname = usePathname();
  const router = useRouter();

  const routeConfig = getRouteByPath(pathname);
  useEffect(() => {
    if (!isHydrated || isAuthLoading) return;
    if (!user || !routeConfig || !canAccessRoute(user, routeConfig)) {
      router.replace(getDefaultRoute(user)); 
    }
  }, [user, isAuthLoading, isHydrated, router, routeConfig]);

  if (!isHydrated || isAuthLoading) return <Loading label="Cargando usuario..." />;

  if (!user || !routeConfig || !canAccessRoute(user, routeConfig)) {
    // mientras redirige o si no puede, no muestra la pantalla
    return null;
  }
  
  const fetchReceptions = async () => {
    try {
      setIsLoading(true);
      const data = await receptionsService.getAll();
      setReceptions(data.items || []);
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error loading receptions", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptions();
  }, []);

  const handleCreate = () => {
    setEditingReception(null);
    setModalOpen(true);
  };

  const handleEdit = (rec: Reception) => {
    if (rec.status === "CONFIRMED") {
      setToast({ message: "Cannot edit a confirmed reception", type: "error" });
      return;
    }
    setEditingReception(rec);
    setModalOpen(true);
  };
/*
  const handleConfirm = async (id: string) => {
    if (!confirm("Confirm this reception? Stock will be updated.")) return;
    setConfirmingId(id);
    try {
      await receptionsService.confirm(id);
      setToast({ message: "Reception confirmed successfully", type: "success" });
      fetchReceptions();
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error confirming reception", type: "error" });
    } finally {
      setConfirmingId(null);
    }
  };*/

  const handleConfirmConfirmed = async (id: string) => {
  setConfirmingId(id);
  try {
    await receptionsService.confirm(id);
    setToast({ message: "Reception confirmed successfully", type: "success" });
    fetchReceptions();
  } catch (error: any) {
    setToast({ message: error?.response?.data?.message || "Error confirming reception", type: "error" });
  } finally {
    setConfirmingId(null);
  }
};

  const handleDelete = (rec: Reception) => {
    if (rec.status === "CONFIRMED") {
      setToast({ message: "Cannot delete a confirmed reception", type: "error" });
      return;
    }
    setReceptionToDelete(rec);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!receptionToDelete) return;
    try {
      await receptionsService.delete(receptionToDelete.id);
      setToast({ message: "Reception deleted successfully", type: "success" });
      fetchReceptions();
      setConfirmOpen(false);
      setReceptionToDelete(null);
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error deleting reception", type: "error" });
    }
  };

  const filteredReceptions = receptions.filter((rec) => {
    const term = search.toLowerCase();
    const matchesSearch =
      rec.folio.toLowerCase().includes(term) ||
      rec.supplierNombre.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFilteredPages = Math.ceil(filteredReceptions.length / itemsPerPage);
  const paginatedReceptions = filteredReceptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  //const showPagination = filteredReceptions.length > itemsPerPage;

  const buttonBase = "inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";

  return (
    <div className="app-atmosphere min-h-full px-6 py-6 lg:px-10">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={1000}
            onClose={() => setToast(null)}
          />
        )}

        {/* HEADER */}
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
        Inventory receipt registry.
      </p>
    </div>
  </div>
  <div className="flex items-center justify-end">
    <button onClick={handleCreate} className={buttonBase}>
      <Plus className="mr-2 h-4 w-4" />
      Create
    </button>
  </div>
</div>

{/* TOTAL CHIP */}
<div className="flex flex-col gap-3">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
      <ClipboardList className="h-4 w-4 text-indigo-400" />
      Total receptions: {receptions.length}
    </span>
  </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2 sm:max-w-md">
            <input
              type="text"
              placeholder="Search by folio or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input flex-1 min-w-0"
            />
            <button onClick={() => setSearch("")} className="whitespace-nowrap">
              Clear filter
            </button>
          </div>
          <div className="flex justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "DRAFT" | "CONFIRMED")}
              className="glass-input w-full sm:w-auto"
            >
              <option value="all">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
            </select>
          </div>
        </div>
      </div>
        {isLoading ? (
          <Loading label="Loading receptions..." />
        ) : (
          <div className="glass-card overflow-hidden rounded-[30px]">
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-white/25">
                  <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                    <th className="px-5 py-4">Folio</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Supplier</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-center">Items</th>
                    <th className="px-5 py-4 text-right">Total</th>
                    <th className="px-5 py-4 text-center w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReceptions.length > 0 ? (
                    paginatedReceptions.map((rec) => (
                      <tr key={rec.id} className="border-t border-white/18 transition hover:bg-white/10">
                        <td className="px-5 py-5 font-semibold text-slate-800">{rec.folio}</td>
                        <td className="px-5 py-5 text-slate-700">{new Date(rec.fecha).toLocaleDateString()}</td>
                        <td className="px-5 py-5 text-slate-700">{rec.supplierNombre}</td>
                        <td className="px-5 py-5 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${rec.status === "CONFIRMED" ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"}`}>
                            {rec.status === "CONFIRMED" ? "Confirmed" : "Draft"}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-center">{rec.items.length}</td>
                        <td className="px-5 py-5 text-right font-semibold">${rec.total.toLocaleString()}</td>
                        <td className="px-5 py-5 text-center">
                          <div className="inline-flex items-center gap-2">
                            {rec.status === "CONFIRMED" && (
                              <button
                                onClick={() => setViewingReception(rec)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/45 bg-white/35 products-violet-black-button shadow-sm transition hover:-translate-y-0.5 hover:bg-white/50"
                                title="View details"
                                aria-label="View reception details"
                              >
                                👁️
                              </button>
                            )}
                            {rec.status === "DRAFT" && (
                              <>
                                <button onClick={() => handleEdit(rec)} className="text-yellow-200 hover:text-yellow-100" title="Edit">
                                  ✏️
                                </button>
                                <button
  onClick={() => {
    setReceptionToConfirm(rec.id);
    setConfirmReceptionOpen(true);
  }}
  disabled={confirmingId === rec.id}
  className="text-green-200 hover:text-green-100"
  title="Confirm"
>
  <CheckCircle className="h-4 w-4" />
</button>
                                <button onClick={() => handleDelete(rec)} className="text-red-200 hover:text-red-100" title="Delete">
                                  🗑️
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

            {/* Mobile cards */}
            <div className="grid gap-4 p-4 md:hidden">
              {paginatedReceptions.length > 0 ? (
                paginatedReceptions.map((rec) => (
                  <article key={rec.id} className="rounded-[24px] border border-white/45 bg-white/35 p-4 shadow-[0_8px_20px_rgba(138,108,198,0.12)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase mb-1 text-slate-500">Folio</p>
                        <p className="truncate font-extrabold text-slate-900">{rec.folio}</p>
                        <p className="text-sm text-slate-700">{rec.supplierNombre}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${rec.status === "CONFIRMED" ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"}`}>
                        {rec.status === "CONFIRMED" ? "Confirmed" : "Draft"}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                      <ReceptionMeta label="Date" value={new Date(rec.fecha).toLocaleDateString()} />
                      <ReceptionMeta label="Items" value={String(rec.items.length)} />
                      <ReceptionMeta label="Total" value={`$${rec.total.toLocaleString()}`} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {rec.status === "CONFIRMED" && (
                        <button
                          onClick={() => setViewingReception(rec)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/35 products-violet-black-button shadow-sm transition hover:-translate-y-0.5 hover:bg-white/50"
                          title="View details"
                          aria-label="View reception details"
                        >
                          👁️
                        </button>
                      )}
                      {rec.status === "DRAFT" && (
                        <>
                          <button onClick={() => handleEdit(rec)} className={buttonBase}>✏️</button>
                            <button
  onClick={() => {
    setReceptionToConfirm(rec.id);
    setConfirmReceptionOpen(true);
  }}
  className={buttonBase}
  disabled={confirmingId === rec.id}
>
  ✅
</button>


                          <button onClick={() => handleDelete(rec)} className={buttonBase}>🗑️</button>
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

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 border-t border-white/20 px-5 pt-4">
  <p className="text-sm text-gray-400">Page {currentPage} of {totalFilteredPages}</p>
  <div className="flex gap-2">
    <button
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      disabled={currentPage === 1 || totalFilteredPages === 0}
      className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm products-violet-black-button disabled:opacity-20"
    >
      Previous
    </button>
    <button
      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalFilteredPages))}
      disabled={currentPage === totalFilteredPages || totalFilteredPages === 0}
      className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm products-violet-black-button disabled:opacity-20"
    >
      Next
    </button>
  </div>
</div>
          </div>
        )}

        {/* MODAL VER RECEPCIÓN (solo lectura) */}
        {viewingReception && (
          <Portal>
            <div className="app-modal-overlay app-modal-overlay--padded app-modal-overlay--form">
              <div className="app-modal-shell app-modal-shell--lg glass-card rounded-[28px] overflow-y-auto max-h-full scrollbar-none p-6 md:p-8">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Reception details</h2>
                      <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold bg-emerald-200/80 text-emerald-700">
                        CONFIRMED
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">Read-only view of the reception.</p>
                  </div>
                  <button
                    onClick={() => setViewingReception(null)}
                    className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/45 bg-white/35 text-slate-500 hover:bg-white/60 transition font-bold"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-4">
                  {/* Folio */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Folio</span>
                    <div className="glass-input bg-white/10 text-slate-700 font-bold cursor-default select-all">{viewingReception.folio}</div>
                  </div>
                  {/* Date */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Date</span>
                    <div className="glass-input bg-white/10 text-slate-700 cursor-default">{new Date(viewingReception.fecha).toLocaleDateString()}</div>
                  </div>
                  {/* Supplier */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Supplier</span>
                    <div className="glass-input bg-white/10 text-slate-700 cursor-default">{viewingReception.supplierNombre}</div>
                  </div>
                  {/* Notes */}
                  {(viewingReception as any).notas !== undefined && (
                    <div className="flex flex-col gap-1 md:col-span-3">
                      <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Notes</span>
                      <div className="glass-input bg-white/10 text-slate-700 cursor-default min-h-[40px]">
                        {(viewingReception as any).notas || <span className="italic text-slate-400">—</span>}
                      </div>
                    </div>
                  )}
                  {/* Items */}
                  <div className="md:col-span-3">
                    <span className="block text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500 mb-2">Products</span>
                    <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto scrollbar-none">
                      {viewingReception.items.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-wrap gap-2 items-center rounded-2xl border border-white/40 bg-white/25 p-3 text-sm"
                        >
                          <span className="flex-1 min-w-[160px] font-semibold text-slate-800">
                            {item.productNombre || item.productId}
                            {item.sku ? <span className="ml-2 text-xs text-slate-500 font-normal">({item.sku})</span> : null}
                          </span>
                          <span className="w-20 text-center text-slate-700">
                            <span className="text-xs text-slate-500 mr-1">Qty:</span>{item.cantidad}
                          </span>
                          <span className="w-28 text-right text-slate-700">
                            ${Number(item.precioUnitario ?? item.precioCompra ?? 0).toFixed(2)}
                          </span>
                          <span className="w-24 text-right font-bold text-slate-800">
                            ${(Number(item.cantidad) * Number(item.precioUnitario ?? item.precioCompra ?? 0)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <div className="rounded-2xl border border-white/40 bg-white/25 px-4 py-2 text-sm font-bold text-slate-800">
                        Total: ${viewingReception.total.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Portal>
        )}

        <ReceptionFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchReceptions}
          recepcion={editingReception}
           setToast={setToast}
        />

        <ConfirmModal
          open={confirmOpen}
          title="Delete reception"
          message={`Are you sure you want to delete reception "${receptionToDelete?.folio}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)}
          confirmButtonClassName="products-violet-black-button"
          cancelButtonClassName="products-violet-black-button"
        />
        <ConfirmModal
  open={confirmReceptionOpen}
  title="Confirm reception"
  message="Confirm this reception? Stock will be updated."
  onConfirm={() => {
    if (receptionToConfirm) {
      handleConfirmConfirmed(receptionToConfirm);
    }
    setConfirmReceptionOpen(false);
    setReceptionToConfirm(null);
  }}
  onCancel={() => {
    setConfirmReceptionOpen(false);
    setReceptionToConfirm(null);
  }}
  confirmButtonClassName="products-violet-black-button"
  cancelButtonClassName="products-violet-black-button"
/>


      </div>
    </div>
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
