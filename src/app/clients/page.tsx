"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Loading } from "@/components/ui/Loading";
import { Toast } from "@/components/ui/Toast";
import { clientsService } from "@/services/clients.service";
import type { Client } from "@/types/client";
import { AlertTriangle, ChevronLeft, ChevronRight, User, Plus, Power } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

type StatusFilter = "all" | "active" | "inactive";

type ClientFormState = {
  nombre: string;
  rfc?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  contacto?: string | null;
  notas?: string | null;
  activo: boolean;
};

type ClientFormErrors = Partial<Record<keyof ClientFormState, string>>;

const itemsPerPage = 3;

const emptyForm: ClientFormState = {
  nombre: "",
  rfc: "",
  email: "",
  telefono: "",
  direccion: "",
  contacto: "",
  notas: "",
  activo: true,
};

function toFormState(client?: Client | null): ClientFormState {
  if (!client) return emptyForm;
  return {
    nombre: client.nombre || "",
    rfc: client.rfc ?? "",
    email: client.email ?? "",
    telefono: client.telefono ?? "",
    direccion: client.direccion ?? "",
    contacto: client.contacto ?? "",
    notas: client.notas ?? "",
    activo: typeof client.activo === "string" ? client.activo === "true" : (client.activo ?? true),
  };
}

function normalizeOptionalText(value: string | undefined | null) {
  const trimmed = value?.trim() || "";
  return trimmed === "" ? null : trimmed;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<ClientFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [statusToast, setStatusToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const requestSeqRef = useRef(0);
  const showPagination = totalItems > itemsPerPage;

  const buildQuery = () => {
    const query: Record<string, string | number | boolean> = {
      page: currentPage,
      limit: itemsPerPage,
    };
    const trimmedSearch = search.trim();
    if (trimmedSearch) query.q = trimmedSearch;
    if (statusFilter === "active") query.activo = true;
    if (statusFilter === "inactive") query.activo = false;
    return query;
  };

  const fetchClients = async (opts?: { search?: string; status?: StatusFilter; page?: number }) => {
    const requestSeq = ++requestSeqRef.current;
    const q = opts?.search !== undefined ? opts.search : search;
    const status = opts?.status !== undefined ? opts.status : statusFilter;
    const page = opts?.page !== undefined ? opts.page : currentPage;

    const query: Record<string, string | number | boolean> = {
      page,
      limit: itemsPerPage,
    };

    const trimmedSearch = String(q || "").trim();
    if (trimmedSearch) query.q = trimmedSearch;
    if (status === "active") query.activo = true;
    if (status === "inactive") query.activo = false;

    try {
      setIsLoading(true);
      const data = await clientsService.getAll(query);
      if (requestSeq !== requestSeqRef.current) return;
      const items = data.items || [];
      setClients(items);
      setTotalItems(data.total || 0);
      setTotalPages(Math.max(1, Math.ceil((data.total || 0) / (data.limit || itemsPerPage))));
    } catch (error: any) {
      if (requestSeq !== requestSeqRef.current) return;
      setToast({
        message:
          error?.response?.data?.message || "Error loading clients",
        type: "error",
      });
    } finally {
      if (requestSeq !== requestSeqRef.current) return;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchClients();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search, statusFilter, currentPage]);
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);
  useEffect(() => { setCurrentPage((page) => Math.min(page, totalPages)); }, [totalPages]);

  const validateForm = () => {
    const nextErrors: ClientFormErrors = {};
    const nombre = form.nombre.trim();
    if (!nombre) nextErrors.nombre = "Name is required";
    else if (nombre.length < 2) nextErrors.nombre = "Name must have at least 2 characters";
    if (form.email && !form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) nextErrors.email = "Invalid email";
    return nextErrors;
  };

  const openCreate = () => {
    setEditingClient(null);
    setForm(emptyForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setForm(toFormState(client));
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleChange = (event: any) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    const nextErrors = validateForm();
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setToast({ message: "Review fields before saving", type: "error" });
      return;
    }
    const payload = {
      nombre: form.nombre.trim(),
      rfc: normalizeOptionalText(form.rfc),
      email: normalizeOptionalText(form.email),
      telefono: normalizeOptionalText(form.telefono),
      direccion: normalizeOptionalText(form.direccion),
      contacto: normalizeOptionalText(form.contacto),
      notas: normalizeOptionalText(form.notas),
      activo: form.activo,
    };
    try {
      setIsSaving(true);
      if (editingClient) {
        await clientsService.update(editingClient.id, payload);
        setToast({ message: "Client updated successfully", type: "success" });
      } else {
        await clientsService.create(payload);
        setToast({ message: "Client created successfully", type: "success" });
      }
      setIsModalOpen(false);
      setEditingClient(null);
      setForm(emptyForm);
      await fetchClients();
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error saving client", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (client: Client) => {
    try {
      await clientsService.toggleActive(client.id, !client.activo);
      setStatusToast({
        message: client.activo
          ? "Client deactivated successfully"
          : "Client activated successfully",
        type: "success",
      });
      await fetchClients();
    } catch (error: any) {
      setStatusToast({
        message: error?.response?.data?.message || "Error changing client status",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;
    try {
      await clientsService.delete(clientToDelete.id);
      setToast({ message: "Client deleted successfully", type: "success" });
      setConfirmOpen(false);
      setClientToDelete(null);
      await fetchClients();
    } catch (error: any) {
      setToast({ message: error?.response?.data?.message || "Error deleting client", type: "error" });
    }
  };

  const buttonBase = "inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";
  const iconButtonBase = "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/35 products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";

  return (
    <div className="app-atmosphere min-h-full px-6 py-6 lg:px-10">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6">
        {toast && (
          <Toast message={toast.message} type={toast.type} duration={3000} onClose={() => setToast(null)} />
        )}
        {statusToast && (
          <Toast
            message={statusToast.message}
            type={statusToast.type}
            duration={1000}
            portal={false}
            overlayClassName="app-modal-overlay app-modal-overlay--padded app-alert-overlay--module"
            shellClassName="app-modal-shell--xl glass-card p-6 md:p-8"
            onClose={() => setStatusToast(null)}
          />
        )}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-md flex items-center justify-center">
              <User className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                Clients
              </h1>
              <p className="mt-1 text-sm text-slate-600">Client directory.</p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 lg:min-w-[31rem]">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <div className="flex-1">
                <Navbar
                  search={search}
                  setSearch={(v: string) => {
                    setSearch(v);
                    setCurrentPage(1);
                    void fetchClients({ search: v, status: statusFilter, page: 1 });
                  }}
                  moduleFilter={statusFilter}
                  setModuleFilter={(v: string) => {
                    const newStatus = v as StatusFilter;
                    setStatusFilter(newStatus);
                    setCurrentPage(1);
                    void fetchClients({ search, status: newStatus, page: 1 });
                  }}
                  modules={["all", "active", "inactive"]}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setCurrentPage(1);
                    void fetchClients({ search: "", status: "all", page: 1 });
                  }}
                  className={`${buttonBase} w-full whitespace-nowrap min-w-[9rem] sm:w-auto`}
                >
                  Clear filter
                </button>

                <button onClick={openCreate} className={`${buttonBase} w-full whitespace-nowrap min-w-[9rem] sm:w-auto`}>
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Loading label="Loading clients..." />
        ) : (
          <div className="glass-card overflow-hidden rounded-[30px]">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-white/25">
                  <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">RFC</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Phone</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.length > 0 ? (
                    clients.map((client) => (
                      <tr key={client.id} className="border-t border-white/18 transition hover:bg-white/10">
                        <td className="px-5 py-5 font-extrabold text-slate-800">{client.nombre}</td>
                        <td className="px-5 py-5 text-slate-700">{client.rfc || "-"}</td>
                        <td className="px-5 py-5 text-slate-700">{client.email || "-"}</td>
                        <td className="px-5 py-5 text-slate-700">{client.telefono || "-"}</td>
                        <td className="px-5 py-5 text-slate-700">{client.contacto || "-"}</td>
                        <td className="px-5 py-5">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${client.activo ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"}`}>
                            {client.activo ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button onClick={() => openEdit(client)} className={iconButtonBase} title="Edit" aria-label="Edit client">
                              ✏️
                            </button>
                            <button
                              onClick={() => void handleToggleActive(client)}
                              className={`${buttonBase} px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em]`}
                              title={client.activo ? "Deactivate" : "Activate"}
                              aria-label={client.activo ? "Deactivate client" : "Activate client"}
                            >
                              <Power className="mr-1 h-3.5 w-3.5" /> {client.activo ? "Off" : "On"}
                            </button>
                            <button
                              onClick={() => {
                                setClientToDelete(client);
                                setConfirmOpen(true);
                              }}
                              className={iconButtonBase}
                              title="Delete"
                              aria-label="Delete client"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center text-slate-500">
                        No clients registered
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Móvil: cards sencillas, puedes inspirarte en el responsive de productos */}
            <div className="grid gap-4 p-4 md:hidden">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <article
                    key={client.id}
                    className="rounded-[24px] border border-white/45 bg-white/35 p-4 shadow-[0_8px_20px_rgba(138,108,198,0.12)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-slate-500">Name</p>
                        <p className="mt-1 truncate text-lg font-extrabold text-slate-900">{client.nombre}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{client.email || "-"}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${client.activo ? "bg-emerald-200/80 text-emerald-700" : "bg-slate-200/80 text-slate-600"}`}>
                        {client.activo ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <MobileMeta label="RFC" value={client.rfc || "-"} />
                      <MobileMeta label="Phone" value={client.telefono || "-"} />
                      <MobileMeta label="Contact" value={client.contacto || "-"} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button 
                        onClick={() => openEdit(client)} 
                        className={iconButtonBase}
                        title="Edit"
                        aria-label="Edit client">
                        ✏️
                      </button>
                      <button 
                        onClick={() => void handleToggleActive(client)} 
                        className={`${buttonBase} px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em]`}
                        title={client.activo ? "Deactivate" : "Activate"}
                        aria-label={client.activo ? "Deactivate client" : "Activate client"}>
                        <Power className="mr-1 h-3.5 w-3.5" />
                        {client.activo ? "Off" : "On"}
                      </button>
                      <button
                        onClick={() => { setClientToDelete(client); setConfirmOpen(true); }}
                        className={iconButtonBase}
                        title="Delete"
                        aria-label="Delete client"
                      >🗑️</button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/45 bg-white/35 px-4 py-10 text-center text-slate-500">
                  No clients registered
                </div>
              )}
            </div>
            {/* Paginación */}
            <div className="flex justify-between items-center mt-2 mb-4 border-t border-white/20 px-5 pt-4">
              <p className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={!showPagination || currentPage === 1}
                  className={
                    `px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm products-violet-black-button
                    ${currentPage === 1 ? "opacity-60 cursor-not-allowed pointer-events-none" : ""} color="var(--product-violet-black)"`
                  }>Previous</button>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                  disabled={!showPagination || currentPage === totalPages}
                  className={
                    `px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm products-violet-black-button
                    ${currentPage === totalPages ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`
                  }>Next</button>
              </div>
            </div>
          </div>
        )}

      </div>
      {/* MODAL CREAR/EDITAR */}
      {isModalOpen && (
        <div className="app-modal-overlay app-modal-overlay--padded">
          <div className="app-modal-shell app-modal-shell--lg glass-card rounded-[28px] p-6 md:p-8">
            <div className="mb-5">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {editingClient ? "Edit client" : "New client"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">Capture name, contact and status.</p>
            </div>
            <form
              className="grid gap-x-3 gap-y-4
                grid-cols-1
                md:grid-cols-3
                md:gap-y-3"
            >
              <Field label="Name" error={formErrors.nombre} className="md:col-span-1">
                <input name="nombre" value={form.nombre} onChange={handleChange} className="glass-input w-full" placeholder="Name" />
              </Field>
              <Field label="RFC" className="md:col-span-1">
                <input name="rfc" value={form.rfc || ""} onChange={handleChange} className="glass-input w-full" placeholder="RFC" />
              </Field>
              <Field label="Email" error={formErrors.email} className="md:col-span-1">
                <input name="email" value={form.email || ""} onChange={handleChange} className="glass-input w-full" placeholder="Email" />
              </Field>
              <Field label="Contact" className="md:col-span-1">
                <input name="contacto" value={form.contacto || ""} onChange={handleChange} className="glass-input w-full" placeholder="Contact" />
              </Field>
              <Field label="Phone" className="md:col-span-1">
                <input name="telefono" value={form.telefono || ""} onChange={handleChange} className="glass-input w-full" placeholder="Phone" />
              </Field>
              <Field label="Address" className="md:col-span-1">
                <input name="direccion" value={form.direccion || ""} onChange={handleChange} className="glass-input w-full" placeholder="Address" />
              </Field>
              <Field label="Notes" className="md:col-span-3">
                <textarea name="notas" value={form.notas || ""} onChange={handleChange} className="glass-input w-full min-h-20" placeholder="Any notes" />
              </Field>
              <div className="md:col-span-3 flex items-center gap-3 rounded-2xl border border-white/40 bg-white/25 px-4 py-3">
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-white/60 text-[#9a7ef0] focus:ring-[#9a7ef0]"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Active client</p>
                  <p className="text-xs text-slate-600">
                    You can activate or deactivate the client without deleting it.
                  </p>
                </div>
              </div>
              <div className="md:col-span-3 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className={buttonBase}>Cancel</button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold !text-[#9a7ef0] shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirmOpen}
        title="Delete client"
        message={`Do you want to delete the client "${clientToDelete?.nombre || ""}"?`}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          setConfirmOpen(false);
          setClientToDelete(null);
        }}
      />
    </div>
  );
}

// Form field component
function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 text-sm font-semibold text-slate-800 ${className}`}>
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

function MobileMeta({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/25 px-3 py-2">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-semibold text-slate-800 ${valueClassName || ""}`}>{value}</p>
    </div>
  );
}