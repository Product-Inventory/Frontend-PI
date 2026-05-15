"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  LayoutDashboard,
  Users,
  Truck,
  Box,
  Package,
  Inbox,
  User,
  Settings,
  Shield,
  ClipboardList,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "Clients", href: "/clients", icon: ClientsIcon },
  { label: "Suppliers", href: "/suppliers", icon: SuppliersIcon },
  { label: "Products", href: "/products", icon: ProductsIcon },
  { label: "Inventory", href: "/inventory", icon: InventoryIcon },
  { label: "Receptions", href: "/recepciones", icon: ReceptionsIcon },
  { label: "Users", href: "/users", icon: UsersIcon },
  { label: "Roles", href: "/roles", icon: RolesIcon },
  { label: "Permissions", href: "/dashboard/permissions", icon: PermissionsIcon },
  { label: "Audit", href: "/audit", icon: AuditIcon },
];

type SidebarIconProps = { active: boolean; className?: string };

function SidebarIconShell({ active, className = "", children }: React.PropsWithChildren<SidebarIconProps>) {
  return (
    <span className={`sidebar-pill-icon ${active ? "text-white" : "text-[#d9d2a0]"} ${className}`}>
      {children}
    </span>
  );
}

function DashboardIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <LayoutDashboard size={20} />
    </SidebarIconShell>
  );
}

function ClientsIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <Users size={20} />
    </SidebarIconShell>
  );
}

function SuppliersIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <Truck size={20} />
    </SidebarIconShell>
  );
}

function ProductsIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <Box size={20} />
    </SidebarIconShell>
  );
}

function InventoryIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <Package size={20} />
    </SidebarIconShell>
  );
}

function ReceptionsIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <Inbox size={20} />
    </SidebarIconShell>
  );
}

function UsersIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <User size={20} />
    </SidebarIconShell>
  );
}

function RolesIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <Settings size={20} />
    </SidebarIconShell>
  );
}

function PermissionsIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <Shield size={20} />
    </SidebarIconShell>
  );
}

function AuditIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <ClipboardList size={20} />
    </SidebarIconShell>
  );
}

export default function AdminSidebar({ open = true, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleSignOut = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <aside className={`sidebar-shell fixed left-0 top-0 z-[60] flex h-screen w-[274px] flex-col px-3 py-3 text-white transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="sidebar-brand flex flex-shrink-0 items-center gap-3 px-4 py-4">
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-cyan-300 transition-transform hover:scale-105 cursor-pointer"
          aria-label="Close sidebar"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-cyan-100" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3 4 7.5 12 12l8-4.5L12 3Z" />
            <path d="M4 16.5 12 21l8-4.5" />
            <path d="M4 7.5V16.5L12 21V12" />
            <path d="M20 7.5V16.5L12 21" />
          </svg>
        </button>
        <p className="text-[1.5rem] font-extrabold tracking-tight text-white">Inventory Pro</p>
      </div>

      <div className="sidebar-divider mx-2 my-4 flex-shrink-0" />

      <nav className="sidebar-list custom-scrollbar flex-1 flex flex-col justify-around overflow-y-auto px-1 pr-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const href = item.label === "Orders" ? "/orders" : item.href;
          const Icon = item.icon;

          return (
            <Link
              key={`${item.label}-${item.href}`}
              href={href}
              className={`sidebar-pill ${isActive ? "sidebar-pill-active" : ""}`}
            >
              <Icon active={isActive} className="shrink-0" />
              <span className={`sidebar-pill-label ${isActive ? "font-extrabold text-white" : "font-semibold text-white/88"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-user-card flex-shrink-0 mt-auto rounded-t-[24px] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[#6b54bf] text-lg font-extrabold text-white shadow-[0_0_0_3px_rgba(172,140,255,0.25)]">
            {user?.nombre?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[1.05rem] font-extrabold leading-tight text-white">
              {user?.nombre ? `${user.nombre} ${user.apellido || ""}`.trim() : "Admin System"}
            </p>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/75">
              {user?.role || "ADMIN"}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="sidebar-signout flex-shrink-0 w-full px-4 py-3 text-[1.18rem] font-extrabold text-white flex items-center justify-center gap-3"
        aria-label="Sign out"
      >
        <LogOut size={20} className="text-white/90" />
        <span>Sign out</span>
      </button>
    </aside>
  );
}