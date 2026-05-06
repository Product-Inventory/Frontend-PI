"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { rolesService } from "@/services/roles.service";
import { Role } from "@/types/role";
import { Settings, Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Toast } from "@/components/ui/Toast";

function RoleIcon({ className = "h-6 w-6 text-white" }: { className?: string }) {
    return <Settings className={className} size={24} />;
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
    });

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const data = await rolesService.getAll();
            setRoles(data.items || data);
        } catch (error) {
            console.error("Error al cargar roles:", error);
            alert("Error al cargar roles");
        } finally {
            setIsLoading(false);
        }
    };

    const openCreate = () => {
        setEditingRole(null);
        setForm({ nombre: "", descripcion: "" });
        setIsModalOpen(true);
    };

    const openEdit = (r: Role) => {
        setEditingRole(r);
        setForm({ nombre: r.nombre || "", descripcion: r.descripcion || "" });
        setIsModalOpen(true);
    };

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            if (editingRole) {
                await rolesService.update(String(editingRole.id), form);
                setToast({ message: "Role updated successfully", type: "success" });
            } else {
                await rolesService.create(form);
                setToast({ message: "Role created successfully", type: "success" });
            }

            setIsModalOpen(false);
            fetchRoles();
        } catch (err: any) {
            console.error(err);
            setToast({ message: err?.response?.data?.message || "Error saving role", type: "error" });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este rol?")) return;

        try {
            await rolesService.delete(String(id));
            setToast({ message: "Role deleted successfully", type: "success" });
            fetchRoles();
        } catch (err) {
            console.error(err);
            setToast({ message: "Error deleting role", type: "error" });
        }
    };

    const columns = [
        { header: "Nombre", accessor: "nombre" as const },
        { header: "Descripción", accessor: "descripcion" as const },
        {
            header: "",
            render: (row: Role) => (
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => openEdit(row)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-purple-500 hover:scale-105 transition"
                        title="Editar"
                    >
                        <Pencil size={18} className="text-purple-300 hover:text-white" />
                    </button>

                    <button
                        onClick={() => handleDelete(row.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-purple-500 hover:scale-105 transition"
                        title="Eliminar"
                    >
                        <Trash2 size={18} className="text-purple-300 hover:text-white" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                       duration={3000}
                    onClose={() => setToast(null)}
                />
            )}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2 rounded-md flex items-center justify-center">
                            <RoleIcon className="h-6 w-6 text-black" />
                        </div>
                        <h1 className="text-4xl font-semibold text-gray-800 tracking-tight">Roles</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70">
                                <Search size={18} />
                            </span>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-64 pl-10 pr-4 py-2 rounded-full border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none"
                            />
                        </div>

                        <button
                            onClick={openCreate}
                            className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-md hover:opacity-90 grid place-items-center"
                            aria-label="Create role"
                        >
                            <span className="sr-only">Create</span>
                            <Plus size={20} className="text-white" />
                        </button>
                    </div>
                </div>

            {isLoading ? (
                <div className="p-10 text-center">Cargando...</div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                    <DataTable columns={columns} data={roles} />
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 w-96 shadow-xl">
                        <h2 className="text-xl font-semibold text-white mb-4">{editingRole ? "Editar Rol" : "Nuevo Rol"}</h2>

                        <div className="flex flex-col gap-3">
                            <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="px-4 py-2 rounded-lg bg-white/80 focus:outline-none" />
                            <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} className="px-4 py-2 rounded-lg bg-white/80 focus:outline-none" />
                        </div>

                        <div className="flex justify-end gap-2 mt-5">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-white/30 text-white">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

