"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Loading } from "@/components/ui/Loading";
import { Portal } from "@/components/ui/Portal";
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
  type TouchedState = Partial<Record<keyof ClientFormState, boolean>>;
  const [touched, setTouched] = useState<TouchedState>({});
  const [submitted, setSubmitted] = useState(false);

  const requestSeqRef = useRef(0);
  const showPagination = totalItems > itemsPerPage;

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

  function validateField(name: keyof ClientFormState, value: any, form: ClientFormState): string | undefined {
    const v = String(value ?? "").trim();

    switch (name) {
      case "nombre":
        if (!v) return "El nombre es requerido";
        if (v.length < 2) return "El nombre debe tener al menos 2 caracteres";
        return;

      case "rfc":
        if (!v) return "El RFC es requerido";
        if (!(v.length === 12 || v.length === 13)) return "El RFC debe tener 12 o 13 caracteres";
        return;

      case "email":
        if (!v) return "El correo es requerido";
        if (!/^[^@]+@[^@]+\.[^@]+$/.test(v)) return "Correo no válido";
        return;

      case "telefono":
        if (!v) return "El teléfono es requerido";
        if (!/^\d{10}$/.test(v)) return "El teléfono debe tener exactamente 10 dígitos";
        return;

      case "direccion":
        if (!v) return "La dirección es requerida";
        if (v.length < 4) return "La dirección debe tener al menos 4 caracteres";
        return;

      case "contacto":
        if (!v) return "El contacto es requerido";
        if (v.length < 4) return "El contacto debe tener al menos 4 caracteres";
        return;

      // notas es opcional
      case "notas":
      case "activo":
      default:
        return;
    }
  }

  const validateForm = () => {
    const nextErrors: ClientFormErrors = {};

    const nombre = (form.nombre ?? "").trim();
    const rfc = (form.rfc ?? "").trim();
    const email = (form.email ?? "").trim();
    const telefono = (form.telefono ?? "").trim();
    const direccion = (form.direccion ?? "").trim();
    const contacto = (form.contacto ?? "").trim();

    // Nombre: requerido, al menos 2 caracteres
    if (!nombre) nextErrors.nombre = "Name is required";
    else if (nombre.length < 2) nextErrors.nombre = "Name must be at least 2 characters long";

    // RFC: requerido, 12 o 13 caracteres
    if (!rfc) nextErrors.rfc = "RFC is required";
    else if (!(rfc.length === 12 || rfc.length === 13)) nextErrors.rfc = "RFC must have 12 or 13 characters";

    // Email: requerido, formato válido
    if (!email) nextErrors.email = "Email is required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) nextErrors.email = "Invalid email format";

    // Teléfono: requerido, exactamente 10 dígitos numéricos
    if (!telefono) nextErrors.telefono = "Phone is required";
    else if (!/^\d{10}$/.test(telefono)) nextErrors.telefono = "Phone must have exactly 10 digits";

    // Dirección: requerido, al menos 4 caracteres
    if (!direccion) nextErrors.direccion = "Address is required";
    else if (direccion.length < 4) nextErrors.direccion = "Address must be at least 4 characters long";

    // Contacto: requerido, al menos 4 caracteres
    if (!contacto) nextErrors.contacto = "Contact is required";
    else if (contacto.length < 4) nextErrors.contacto = "Contact must be at least 4 characters long";

    // Notas: opcional

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

  const handleBlur = (event: any) => {
    const { name, value, type, checked } = event.target;
    const field = name as keyof ClientFormState;
    const fieldValue = type === "checkbox" ? checked : value;

    setTouched((prev) => ({ ...prev, [field]: true }));

    const message = validateField(field, fieldValue, form);
    setFormErrors((prev) => ({ ...prev, [field]: message }));
  };

  const handleChange = (event: any) => {
    const { name, value, type, checked } = event.target;
    const field = name as keyof ClientFormState;
    const nextValue = type === "checkbox" ? checked : value;

    setForm((current) => {
      const nextForm = { ...current, [field]: nextValue };

      if (submitted || touched[field]) {
        const message = validateField(field, nextValue, nextForm);
        setFormErrors((prev) => ({ ...prev, [field]: message }));
      }

      return nextForm;
    });
  };

  const handleSave = async () => {
    const nextErrors = validateForm();
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setToast({ message: "Complete fields before saving", type: "error" });
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
  const activeCount   = clients.filter(c => c.activo).length;
  const inactiveCount = clients.filter(c => !c.activo).length;
  let counterValue = 0;
  let counterLabel = "";
  let counterIcon = <User className="h-4 w-4 text-indigo-500" />;
  let counterClass = "bg-blue-50 text-indigo-900";

  if (statusFilter === "all") {
    counterLabel = "REGISTERED CLIENTS";
    counterValue = totalItems;
    counterIcon = <User className="h-4 w-4 text-indigo-500" />;
    counterClass = "bg-blue-50 text-indigo-900";
  } else if (statusFilter === "active") {
    counterLabel = "ACTIVE CLIENTS";
    counterValue = activeCount;
    counterIcon = <Power className="h-4 w-4 text-emerald-600" />;
    counterClass = "bg-emerald-50 text-emerald-700";
  } else if (statusFilter === "inactive") {
    counterLabel = "INACTIVE CLIENTS";
    counterValue = inactiveCount;
    counterIcon = <Power className="h-4 w-4 text-gray-400" />;
    counterClass = "bg-gray-100 text-slate-600";
  }

  return (
    <div className="app-atmosphere relative min-h-full px-6 py-6 lg:px-10 rounded-3xl overflow-hidden">
      {toast && (
        <Toast message={toast.message} type={toast.type} duration={1000} onClose={() => setToast(null)} />
      )}
      {statusToast && (
        <Toast
          message={statusToast.message}
          type={statusToast.type}
          duration={1000}
          onClose={() => setStatusToast(null)}
        />
      )}
      <div className="mx-auto relative flex min-h-full w-full max-w-7xl flex-col gap-6 rounded-3xl">
        {/* HEADER */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-2xl flex items-center justify-center">
              <User className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                Clients
              </h1>
              <p className="mt-1 text-sm text-slate-600">Client directory.</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="rounded-full px-6 py-2 text-base font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-[#392750] border border-white/50 shadow hover:bg-white/80 transition inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Create
          </button>
        </div>
        {/* Counter CHIP */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className={`glass-chip inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] shadow border border-white/50 ${counterClass}`}>
                {counterIcon}
                {counterLabel}: 
                <span className="ml-1 font-extrabold tracking-wide">{counterValue}</span>
              </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                placeholder="Search by name, email, rfc..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                  void fetchClients({ search: e.target.value, status: statusFilter, page: 1 });
                }}
                className="glass-input w-full max-w-xs"
                style={{ minWidth: 0 }}
              />
              <button
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                  void fetchClients({ search: "", status: statusFilter, page: 1 });
                }}
                className={`${buttonBase} whitespace-nowrap`}
              >
                Clear filter
              </button>
            </div>
            <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
                  setCurrentPage(1);
                  void fetchClients({ search, status: e.target.value as StatusFilter, page: 1 });
                }}
                className="w-full sm:w-26 max-w-xs px-4 py-2 rounded-xl border glass-input shadow-sm text-base bg-white/70"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
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
        <Portal>
        <div className="app-modal-overlay app-modal-overlay--padded app-modal-overlay--form">
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
                <input name="nombre" value={form.nombre} onChange={handleChange} onBlur={handleBlur} className="glass-input w-full" placeholder="Name" />
              </Field>
              <Field label="RFC" error={formErrors.rfc} className="md:col-span-1">
                <input name="rfc" value={form.rfc || ""} onChange={handleChange} onBlur={handleBlur} className="glass-input w-full" placeholder="RFC" />
              </Field>
              <Field label="Email" error={formErrors.email} className="md:col-span-1">
                <input name="email" value={form.email || ""} onChange={handleChange} onBlur={handleBlur} className="glass-input w-full" placeholder="Email" />
              </Field>
              <Field label="Contact" error={formErrors.contacto} className="md:col-span-1">
                <input name="contacto" value={form.contacto || ""} onChange={handleChange} onBlur={handleBlur} className="glass-input w-full" placeholder="Contact" />
              </Field>
              <Field label="Phone" error={formErrors.telefono} className="md:col-span-1">
                <input name="telefono" value={form.telefono || ""} onChange={handleChange} onBlur={handleBlur} className="glass-input w-full" placeholder="Phone" />
              </Field>
              <Field label="Address" error={formErrors.direccion} className="md:col-span-1">
                <input name="direccion" value={form.direccion || ""} onChange={handleChange} onBlur={handleBlur} className="glass-input w-full" placeholder="Address" />
              </Field>
              <Field label="Notes" error={formErrors.notas} className="md:col-span-3">
                <textarea name="notas" value={form.notas || ""} onChange={handleChange} onBlur={handleBlur} className="glass-input w-full min-h-20" placeholder="Any notes" />
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="inline-flex h-10 items-center justify-center rounded-full border border-white/45 bg-white/45 px-5 text-sm font-semibold products-violet-black-button shadow-sm transition hover:bg-white/55">Cancel</button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold products-violet-black-button shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
        </Portal>
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