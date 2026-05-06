"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "Clients", href: "/clients", icon: ClientsIcon },
  { label: "Suppliers", href: "/suppliers", icon: SuppliersIcon },
  { label: "Products", href: "/products", icon: ProductsIcon },
  { label: "Inventory", href: "/inventory", icon: InventoryIcon },
  { label: "Movements", href: "/inventory", icon: MovementsIcon },
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" rx="1.2" />
        <rect x="14" y="4" width="6" height="6" rx="1.2" />
        <rect x="4" y="14" width="6" height="6" rx="1.2" />
        <rect x="14" y="14" width="6" height="6" rx="1.2" />
      </svg>
    </SidebarIconShell>
  );
}

function ClientsIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 20a4 4 0 0 0-8 0" />
        <circle cx="12" cy="8" r="3.2" />
        <path d="M6 20a4.5 4.5 0 0 1 3.2-4.3" />
        <path d="M18 20a4.5 4.5 0 0 0-3.2-4.3" />
      </svg>
    </SidebarIconShell>
  );
}

function SuppliersIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 7h10v10H3z" />
        <path d="M13 10h4l3 3v4h-7z" />
        <circle cx="7" cy="19" r="1.4" />
        <circle cx="17" cy="19" r="1.4" />
      </svg>
    </SidebarIconShell>
  );
}

function ProductsIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3 4.5 7l7.5 4 7.5-4-7.5-4Z" />
        <path d="M4.5 7v10l7.5 4 7.5-4V7" />
        <path d="m12 11 7.5-4" />
        <path d="M12 11v10" />
      </svg>
    </SidebarIconShell>
  );
}

function InventoryIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    </SidebarIconShell>
  );
}

function MovementsIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 8h12" />
        <path d="m12 4 4 4-4 4" />
        <path d="M20 16H8" />
        <path d="m12 20-4-4 4-4" />
      </svg>
    </SidebarIconShell>
  );
}

function ReceptionsIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 8h16v10H4z" />
        <path d="M7 8V5h10v3" />
        <path d="M9 12h6" />
        <path d="m9 15 3 3 3-3" />
      </svg>
    </SidebarIconShell>
  );
}

function UsersIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 20a4 4 0 0 1 8 0" />
        <circle cx="13" cy="8" r="3" />
        <path d="M4 20a4.6 4.6 0 0 1 5.3-4.4" />
        <circle cx="6.5" cy="9" r="2.3" />
      </svg>
    </SidebarIconShell>
  );
}

function RolesIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 19a4 4 0 1 1 4-4" />
        <circle cx="10" cy="9" r="3" />
        <path d="M17 11.5v3" />
        <path d="M15.5 13h3" />
      </svg>
    </SidebarIconShell>
  );
}

function PermissionsIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3 4.5 6v5.5C4.5 16 7.8 19.5 12 21c4.2-1.5 7.5-5 7.5-9.5V6L12 3Z" />
        <path d="M12 9v4" />
        <circle cx="12" cy="16.5" r="1" />
      </svg>
    </SidebarIconShell>
  );
}

function AuditIcon({ active, className }: SidebarIconProps) {
  return (
    <SidebarIconShell active={active} className={className}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 3h7l3 3v15H7z" />
        <path d="M14 3v4h4" />
        <path d="M9 11h6" />
        <path d="M9 15h4" />
      </svg>
    </SidebarIconShell>
  );
}

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
    <aside className="sidebar-shell flex h-screen w-[274px] shrink-0 flex-col rounded-r-[34px] px-3 py-3 text-white">
      <div className="sidebar-brand flex items-center gap-3 rounded-t-[28px] rounded-b-none px-4 py-4">
        <div className="glass-chip flex h-10 w-10 items-center justify-center rounded-2xl text-xl text-cyan-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-cyan-100" aria-hidden="true">
            <path d="M12 3 4 7.5 12 12l8-4.5L12 3Z" />
            <path d="M4 16.5 12 21l8-4.5" />
            <path d="M4 7.5V16.5L12 21V12" />
            <path d="M20 7.5V16.5L12 21" />
          </svg>
        </div>
        <p className="text-[1.5rem] font-extrabold tracking-tight text-white">Mockout UI</p>
      </div>

      <div className="sidebar-divider mx-2 my-4" />

      <nav className="sidebar-list custom-scrollbar flex-1 space-y-3 overflow-y-auto px-1 pr-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const href = item.label === "Movements" ? "/inventory" : item.href;
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

      <div className="sidebar-user-card mt-4 rounded-t-[24px] px-4 py-4">
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
        className="sidebar-signout mt-3 w-full px-4 py-3 text-[1.18rem] font-extrabold text-white flex items-center justify-center gap-3"
        aria-label="Sign out"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white/90" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        <span>Sign out</span>
      </button>
    </aside>
  );
}