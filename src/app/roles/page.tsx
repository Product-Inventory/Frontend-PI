"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Settings, Plus, Search } from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { Toast } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { rolesService } from "@/services/roles.service";
import { permissionsService } from "@/services/permissions.service";
import type { Role } from "@/types/role";
import type { Permission } from "@/types/permissions";

function RoleIcon({ className = "h-6 w-6 text-white" }: { className?: string }) {
    return <Settings className={className} size={24} />;
}

type RoleFormState = {
    nombre: string;
    descripcion: string;
    permissions: string[];
};

type PermissionGroup = {
    modulo: string;
    items: Permission[];
};

const itemsPerPage = 5;

const emptyForm: RoleFormState = {
    nombre: "",
    descripcion: "",
    permissions: [],
};

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [permissionsLoading, setPermissionsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [form, setForm] = useState<RoleFormState>(emptyForm);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [modalToast, setModalToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

    useEffect(() => {
        void fetchRoles();
        void fetchPermissions();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const fetchRoles = async () => {
        try {
            setIsLoading(true);
            const data = await rolesService.getAll();
            setRoles(data.items || data);
        } catch (error) {
            console.error("Error loading roles:", error);
            setToast({ message: "Error loading roles", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            setPermissionsLoading(true);
            const data = await permissionsService.getAll();
            setPermissions(data.items || data);
        } catch (error) {
            console.error("Error loading permissions:", error);
            setToast({ message: "Error loading permissions", type: "error" });
        } finally {
            setPermissionsLoading(false);
        }
    };

    const permissionGroups = useMemo<PermissionGroup[]>(() => {
        const grouped = new Map<string, Permission[]>();

        for (const permission of permissions) {
            const modulo = permission.modulo || "other";
            const current = grouped.get(modulo) || [];
            grouped.set(modulo, [...current, permission]);
        }

        return Array.from(grouped.entries())
            .map(([modulo, items]) => ({
                modulo,
                items: [...items].sort((a, b) => a.code.localeCompare(b.code)),
            }))
            .sort((a, b) => a.modulo.localeCompare(b.modulo));
    }, [permissions]);

    const filteredRoles = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        if (!searchText) return roles;

        return roles.filter((role) => {
            return (
                role.nombre.toLowerCase().includes(searchText) ||
                (role.descripcion || "").toLowerCase().includes(searchText) ||
                (role.permissions || []).some((permission) => permission.toLowerCase().includes(searchText))
            );
        });
    }, [roles, search]);

    const totalPages = Math.max(Math.ceil(filteredRoles.length / itemsPerPage), 1);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    const openCreate = () => {
        setEditingRole(null);
        setForm(emptyForm);
        setIsModalOpen(true);
        setModalToast(null);
    };

    const openEdit = (role: Role) => {
        setEditingRole(role);
        setForm({
            nombre: role.nombre || "",
            descripcion: role.descripcion || "",
            permissions: Array.isArray(role.permissions) ? role.permissions : [],
        });
        setIsModalOpen(true);
        setModalToast(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const togglePermission = (code: string) => {
        setForm((current) => {
            const hasPermission = current.permissions.includes(code);
            return {
                ...current,
                permissions: hasPermission
                    ? current.permissions.filter((item) => item !== code)
                    : [...current.permissions, code],
            };
        });
    };

    const toggleModulePermissions = (modulePermissions: Permission[]) => {
        const codes = modulePermissions.map((permission) => permission.code);

        setForm((current) => {
            const selectedSet = new Set(current.permissions);
            const allSelected = codes.every((code) => selectedSet.has(code));

            return {
                ...current,
                permissions: allSelected
                    ? current.permissions.filter((code) => !codes.includes(code))
                    : Array.from(new Set([...current.permissions, ...codes])),
            };
        });
    };

    const handleSave = async () => {
        if (!form.nombre.trim()) {
            setModalToast({ message: "Name is required", type: "error" });
            return;
        }

        const payload = {
            nombre: form.nombre.trim(),
            descripcion: form.descripcion.trim(),
            permissions: form.permissions,
        };

        try {
            setIsSaving(true);

            if (editingRole) {
                await rolesService.update(String(editingRole.id), payload);
                setToast({ message: "Role updated successfully", type: "success" });
            } else {
                await rolesService.create(payload);
                setToast({ message: "Role created successfully", type: "success" });
            }

            setIsModalOpen(false);
            setEditingRole(null);
            setForm(emptyForm);
            setModalToast(null);
            await fetchRoles();
        } catch (err: any) {
            console.error(err);
            setModalToast({ message: err?.response?.data?.message || "Error saving role", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!roleToDelete) return;

        try {
            await rolesService.delete(String(roleToDelete.id));
            setToast({ message: "Role deleted successfully", type: "success" });
            setRoleToDelete(null);
            setConfirmOpen(false);
            await fetchRoles();
        } catch (err) {
            console.error(err);
            setToast({ message: "Error deleting role", type: "error" });
        }
    };

    return (
        <div className="app-atmosphere relative min-h-full rounded-3xl overflow-hidden px-6 py-6 lg:px-10">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    duration={1000}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 rounded-3xl">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2 rounded-2xl flex items-center justify-center">
                            <RoleIcon className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">Roles</h1>
                            <p className="mt-1 text-sm text-slate-600">Assign permissions to each role.</p>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 lg:min-w-[31rem]">
                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                            <div className="relative w-full md:w-80">
                                
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name or description"
                                    className="search-input"
                                />
                            </div>

                            <button
                                onClick={openCreate}
                                className="inline-flex h-10 w-full items-center justify-center rounded-full border border-white/50 bg-white/35 px-5 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50 sm:w-auto"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-10 text-center">Loading...</div>
                ) : (
                    <div className="glass-card overflow-hidden rounded-[40px]">
                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full text-sm">
                                <thead className="bg-white/25">
                                    <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                                        <th className="px-5 py-4">Name</th>
                                        <th className="px-5 py-4">Description</th>
                                        <th className="px-5 py-4">Permissions</th>
                                        <th className="px-5 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedRoles.length > 0 ? (
                                        paginatedRoles.map((role) => (
                                            <tr key={role.id} className="border-t border-white/18 transition hover:bg-white/10">
                                                <td className="px-5 py-5 font-semibold text-slate-800">{role.nombre}</td>
                                                <td className="px-5 py-5 text-slate-700">{role.descripcion || "-"}</td>
                                                <td className="px-5 py-5 text-slate-700">
                                                    <span className="rounded-full bg-slate-200/80 px-3 py-1 text-xs font-bold text-slate-700">
                                                        {(role.permissions || []).length} selected
                                                    </span>
                                                </td>
                                                <td className="px-5 py-5 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            onClick={() => openEdit(role)}
                                                            className="inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => { setRoleToDelete(role); setConfirmOpen(true); }}
                                                            className="inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-14 text-center text-slate-500">
                                                No roles registered
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-4 p-4 md:hidden">
                            {paginatedRoles.length > 0 ? (
                                paginatedRoles.map((role) => (
                                    <article
                                        key={role.id}
                                        className="rounded-3xl border border-white/45 bg-white/35 p-4 shadow-[0_8px_20px_rgba(138,108,198,0.12)]"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-slate-500">
                                                    Role
                                                </p>
                                                <p className="mt-1 truncate text-lg font-extrabold text-slate-900">{role.nombre}</p>
                                                <p className="mt-1 text-base font-semibold text-slate-800">
                                                    {role.descripcion || "-"}
                                                </p>
                                            </div>

                                            <span className="shrink-0 rounded-full bg-slate-200/80 px-3 py-1 text-xs font-bold text-slate-700">
                                                {(role.permissions || []).length} perms
                                            </span>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {(role.permissions || []).slice(0, 4).map((permission) => (
                                                <span
                                                    key={permission}
                                                    className="rounded-full border border-white/40 bg-white/35 px-3 py-1 text-xs font-semibold text-slate-700"
                                                >
                                                    {permission}
                                                </span>
                                            ))}
                                            {(role.permissions || []).length > 4 && (
                                                <span className="rounded-full border border-white/40 bg-white/35 px-3 py-1 text-xs font-semibold text-slate-700">
                                                    +{(role.permissions || []).length - 4}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <button
                                                onClick={() => openEdit(role)}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/45 bg-white/45 px-4 py-2 text-sm font-semibold products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)]"
                                            >
                                                ✏️
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => { setRoleToDelete(role); setConfirmOpen(true); }}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/45 products-violet-black-button shadow-[0_6px_18px_rgba(138,108,198,0.14)]"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="rounded-3xl border border-white/45 bg-white/35 px-4 py-10 text-center text-slate-500">
                                    No roles registered
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-white/20 px-5 pt-4">
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
                    </div>
                )}

            {isModalOpen && (
                <Portal>
                <div className="app-modal-overlay app-modal-overlay--form p-4 sm:p-6">
                    <div className="app-modal-shell app-modal-shell--xl glass-card relative h-full w-full max-h-full overflow-hidden rounded-[40px] border border-white/45 shadow-[0_24px_60px_rgba(17,24,39,0.24)]">
                        <div className="h-full overflow-y-auto scrollbar-none p-6 md:p-8">
                            {modalToast && (
                                <Toast
                                    message={modalToast.message}
                                    type={modalToast.type}
                                    duration={1000}
                                    onClose={() => {
                                        setModalToast(null);
                                        if (modalToast.type === "success") {
                                            setIsModalOpen(false);
                                            setEditingRole(null);
                                            setForm(emptyForm);
                                        }
                                    }}
                                />
                            )}

                            <h2 className="text-2xl font-extrabold tracking-tight text-[#392750]">
                                {editingRole ? "Edit Role" : "New Role"}
                            </h2>
                            <p className="mt-1 text-sm text-[#392750]">
                                Select the permissions that this role can use.
                            </p>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <Field label="Name *">
                                    <input
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        className="glass-input w-full"
                                        placeholder="Manager"
                                    />
                                </Field>

                                <Field label="Description">
                                    <input
                                        name="descripcion"
                                        value={form.descripcion}
                                        onChange={handleChange}
                                        className="glass-input w-full"
                                        placeholder="Optional description"
                                    />
                                </Field>
                            </div>

                            <div className="mt-6">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#392750]">Permissions</h3>
                                        <p className="text-sm text-[#392750]">
                                            {form.permissions.length} selected
                                            {permissionsLoading ? " · Loading permissions..." : ""}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setForm((current) => ({ ...current, permissions: [] }))}
                                        className="inline-flex h-10 items-center justify-center rounded-full border border-white/45 bg-white/45 px-4 text-sm font-semibold products-violet-black-button shadow-sm transition hover:bg-white/55"
                                    >
                                        Clear permissions
                                    </button>
                                </div>

                                {permissionsLoading ? (
                                    <div className="rounded-3xl border border-white/40 bg-white/25 px-4 py-10 text-center text-slate-500">
                                        Loading permissions...
                                    </div>
                                ) : (
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        {permissionGroups.map((group) => {
                                            const allSelected = group.items.length > 0 && group.items.every((permission) => form.permissions.includes(permission.code));

                                            return (
                                                <div key={group.modulo} className="rounded-3xl border border-white/40 bg-white/25 p-4">
                                                    <div className="mb-3 flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-500">
                                                                {group.modulo}
                                                            </p>
                                                            <p className="text-sm font-semibold text-[#392750]">
                                                                {group.items.length} permissions
                                                            </p>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => toggleModulePermissions(group.items)}
                                                            className="inline-flex h-9 items-center justify-center rounded-full border border-white/45 bg-white/45 px-3 text-xs font-semibold products-violet-black-button shadow-sm transition hover:bg-white/55"
                                                        >
                                                            {allSelected ? "Unselect module" : "Select module"}
                                                        </button>
                                                    </div>

                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                        {group.items.map((permission) => {
                                                            const checked = form.permissions.includes(permission.code);

                                                            return (
                                                                <label
                                                                    key={permission.code}
                                                                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 transition ${checked ? "border-blue-400 bg-blue-50/80" : "border-white/40 bg-white/35 hover:bg-white/50"}`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={checked}
                                                                        onChange={() => togglePermission(permission.code)}
                                                                        className="mt-1 h-4 w-4 rounded border-white/60 text-[#9a7ef0] focus:ring-[#9a7ef0]"
                                                                    />
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-sm font-bold text-[#392750]">{permission.nombre}</p>
                                                                        <p className="truncate text-xs text-slate-500">{permission.code}</p>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="inline-flex h-10 w-full items-center justify-center rounded-full border border-white/45 bg-white/45 px-5 text-sm font-semibold products-violet-black-button shadow-sm transition hover:bg-white/55 sm:w-auto"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => void handleSave()}
                                    disabled={isSaving}
                                    className="inline-flex h-10 w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold products-violet-black-button shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </Portal>
            )}
        </div>

            <ConfirmModal
                open={confirmOpen}
                title="Delete role"
                message={`Do you want to delete the role "${roleToDelete?.nombre || ""}"?`}
                onConfirm={() => void handleDelete()}
                onCancel={() => {
                    setConfirmOpen(false);
                    setRoleToDelete(null);
                }}
                cancelButtonClassName=""
                confirmButtonClassName=""
            />
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
            <span>{label}</span>
            {children}
        </label>
    );
}
