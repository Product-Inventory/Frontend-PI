"use client";

import { useEffect, useState } from "react";
import { suppliersService } from "@/services/suppliers.service";
import { Supplier } from "@/types/supplier";
import { Loading } from "@/components/ui/Loading";
import { Spinner } from "@/components/ui/Spinner";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SupplierFormModal from "@/components/forms/SupplierFormModal";
import { Toast } from "@/components/ui/Toast";
import { Truck, Plus, Power, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { canAccessRoute, getDefaultRoute, getRouteByPath } from "@/routes/routeConfig";
import { usePathname, useRouter } from "next/navigation";

const itemsPerPage = 3;

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
  
  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await suppliersService.getAll();
      setSuppliers(data.items || []);
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

  const filteredSuppliers = suppliers.filter((s) => {
    const term = search.toLowerCase();
    const matchesSearch =
      s.nombre.toLowerCase().includes(term) ||
      (s.rfc && s.rfc.toLowerCase().includes(term)) ||
      (s.contacto && s.contacto.toLowerCase().includes(term)) ||
      (s.email && s.email.toLowerCase().includes(term));
    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = s.activo === true;
    if (statusFilter === "inactive") matchesStatus = s.activo === false;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  //const showPagination = filteredSuppliers.length > itemsPerPage;

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
              <Truck className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                Suppliers
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage suppliers and their contact information.
              </p>
            </div>
          </div>
         
            <div className="flex items-center justify-between gap-3">
              
              <button onClick={handleCreate} className={buttonBase}>
                <Plus className="mr-2 h-4 w-4" />
                Create
              </button>
            </div>
          
        </div>

          <div className="flex flex-col gap-3">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
      <Truck className="h-4 w-4 text-indigo-400" />
      Total suppliers: {suppliers.length}
    </span>
  </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2 sm:max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name, RFC, contact or email..."
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
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <div className="glass-card overflow-hidden rounded-[30px]">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-white/25">
                  <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                    <th className="px-5 py-4">Company</th>
                    <th className="px-5 py-4">RFC</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Phone</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-center w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSuppliers.length > 0 ? (
                    paginatedSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-t border-white/18 transition hover:bg-white/10">
                        <td className="px-5 py-5 font-semibold text-slate-800">{supplier.nombre}</td>
                        <td className="px-5 py-5 text-slate-700">{supplier.rfc || "-"}</td>
                        <td className="px-5 py-5 text-slate-700">{supplier.contacto || "-"}</td>
                        <td className="px-5 py-5 text-slate-700">{supplier.email || "-"}</td>
                        <td className="px-5 py-5 text-slate-700">{supplier.telefono || "-"}</td>
                        <td className="px-5 py-5 text-center">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${supplier.activo ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"}`}>
                            {supplier.activo ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button onClick={() => handleEdit(supplier)} className={buttonBase} title="Edit">
                              ✏️
                            </button>
                            <button onClick={() => handleToggleActive(supplier)} className={buttonBase} title={supplier.activo ? "Deactivate" : "Activate"}>
                              <Power className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(supplier)} className={buttonBase} title="Delete">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center text-slate-500">
                        No suppliers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 md:hidden">
              {paginatedSuppliers.length > 0 ? (
                paginatedSuppliers.map((supplier) => (
                  <article key={supplier.id} className="rounded-[24px] border border-white/45 bg-white/35 p-4 shadow-[0_8px_20px_rgba(138,108,198,0.12)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase mb-1 text-slate-500">Company</p>
                        <p className="truncate font-extrabold text-slate-900">{supplier.nombre}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${supplier.activo ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"}`}>
                        {supplier.activo ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                      <SupplierMeta label="RFC" value={supplier.rfc || "-"} />
                      <SupplierMeta label="Contact" value={supplier.contacto || "-"} />
                      <SupplierMeta label="Email" value={supplier.email || "-"} />
                      <SupplierMeta label="Phone" value={supplier.telefono || "-"} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => handleEdit(supplier)} className={buttonBase}>✏️</button>
                      <button onClick={() => handleToggleActive(supplier)} className={buttonBase}>{supplier.activo ? "Off" : "On"}</button>
                      <button onClick={() => handleDelete(supplier)} className={buttonBase}>🗑️</button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/45 bg-white/35 px-4 py-10 text-center text-slate-500">
                  No suppliers found
                </div>
              )}
            </div>

           <div className="flex justify-between items-center mt-4 border-t border-white/20 px-5 pt-4">
  <p className="text-sm text-gray-400">
    Page {currentPage} of {totalPages}
  </p>
  <div className="flex gap-2">
    <button
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      disabled={currentPage === 1 || totalPages === 0}
      className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm products-violet-black-button disabled:opacity-20"
    >
      Previous
    </button>
    <button
      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      disabled={currentPage === totalPages || totalPages === 0}
      className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm products-violet-black-button disabled:opacity-20"
    >
      Next
    </button>
  </div>
</div>
          </div>
        )}

        <SupplierFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchSuppliers}
          supplier={editingSupplier}
            setToast={setToast}
        />

        <ConfirmModal
          open={confirmOpen}
          title="Delete supplier"
          message={`Are you sure you want to delete "${supplierToDelete?.nombre}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)}
          confirmButtonClassName="products-violet-black-button"
          cancelButtonClassName="products-violet-black-button"
        />
      </div>
    </div>
  );
}

function SupplierMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/25 px-3 py-2">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
