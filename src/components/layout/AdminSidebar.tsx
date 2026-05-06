"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "◫" },
  { label: "Clients", href: "/clients", icon: "◌" },
  { label: "Suppliers", href: "/suppliers", icon: "◍" },
  { label: "Products", href: "/products", icon: "◈" },
  { label: "Inventory", href: "/inventory", icon: "▤" },
  { label: "Receptions", href: "/recepciones", icon: "◔" },
  { label: "Users", href: "/users", icon: "◎" },
  { label: "Roles", href: "/roles", icon: "◉" },
  { label: "Permissions", href: "/dashboard/permissions", icon: "◬" },
  { label: "Audit", href: "/audit", icon: "◧" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleSignOut = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <aside className="left-sidebar app-shell flex h-screen w-[260px] shrink-0 flex-col rounded-r-[30px] border-r border-white/20 px-4 py-5">
      <div className="glass-panel mb-4 flex items-center gap-3 rounded-2xl px-4 py-3">
        <div className="glass-chip flex h-9 w-9 items-center justify-center rounded-xl text-lg text-cyan-300">
          ◈
        </div>
        <div>
          <p className="text-3xl font-extrabold leading-none text-white">Mockout UI</p>
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 space-y-2 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`glass-panel flex items-center gap-3 rounded-full px-4 py-2 text-2xl font-semibold transition-all ${
                isActive ? "ring-2 ring-white/60 bg-white/35" : "hover:bg-white/30"
              }`}
            >
              <span className="text-lg leading-none text-cyan-200">{item.icon}</span>
              <span className="leading-none text-white">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="glass-panel mt-4 rounded-2xl px-4 py-3">
        <p className="text-sm font-semibold text-white">
          {user?.nombre ? `${user.nombre} ${user.apellido || ""}`.trim() : "Admin System"}
        </p>
        <p className="text-xs uppercase tracking-wider text-white/80">{user?.role || "ADMIN"}</p>
      </div>

      <button
        onClick={handleSignOut}
        className="mt-3 w-full rounded-full px-4 py-2 text-2xl font-semibold text-white"
      >
        Sign out
      </button>
    </aside>
  );
}