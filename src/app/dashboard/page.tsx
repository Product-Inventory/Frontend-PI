"use client";

import { useEffect, useState } from "react";
import { Users, Package, Truck, Inbox, AlertTriangle, Activity, LayoutDashboard, ArrowUpRight } from "lucide-react";
import { Loading } from "@/components/ui/Loading";
import { Spinner } from "@/components/ui/Spinner";
import { dashboardService } from "@/services/dashboard.service";
import { DashboardSummary } from "@/types/dashboard";
import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/store/auth.store";
import { canAccessRoute, getDefaultRoute, getRouteByPath } from "@/routes/routeConfig";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasPermission = useAuthStore(state => state.hasPermission);

  const { user, isLoading: isAuthLoading, isHydrated } = useAuth();  const pathname = usePathname();
  const router = useRouter();

  const routeConfig = getRouteByPath(pathname);
  const canViewSummary = hasPermission("dashboard:read");

  useEffect(() => {
    if (!isHydrated || isAuthLoading) return;
    if (!user || !routeConfig || !canAccessRoute(user, routeConfig)) {
      router.replace(getDefaultRoute(user)); 
    }
  }, [user, isAuthLoading, isHydrated, router, routeConfig]);

  useEffect(() => {
    if (!isHydrated || isAuthLoading) {
      return;
    }

    if (!user || !routeConfig || !canAccessRoute(user, routeConfig)) {
      return;
    }

    if (!canViewSummary) {
      setIsLoading(false);
      return;
    }

    fetchDashboard();
  }, [canViewSummary, isAuthLoading, isHydrated, routeConfig, user]);

  const fetchDashboard = async () => {
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Spinner />;
  if (!summary) return <p className="text-gray-500 p-10 font-bold text-center">Failed to load dashboard</p>;

  const stats = [
    {
      title: "Users",
      value: summary.totals.users,
      subtitle: `${summary.totals.activeUsers} active users`,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-100",
      permission: "users:read",
    },
    {
      title: "Products",
      value: summary.totals.products,
      subtitle: `${summary.lowStockCount} low stock`,
      icon: <Package className="h-6 w-6 text-indigo-600" />,
      color: "bg-indigo-100",
      permission: "products:read",
    },
    {
      title: "Suppliers",
      value: summary.totals.suppliers,
      subtitle: "Registered suppliers",
      icon: <Truck className="h-6 w-6 text-amber-600" />,
      color: "bg-amber-100",
      permission: "suppliers:read",
    },
    {
      title: "Receptions",
      value: summary.totals.recepciones,
      subtitle: "Inventory entries",
      icon: <Inbox className="h-6 w-6 text-emerald-600" />,
      color: "bg-emerald-100",
      permission: "recepciones:read",
    },
  ];

  const filteredStats = stats.filter(stat =>
    user && (
      user.role?.toLowerCase() === "admin" ||
      (stat.permission && hasPermission(stat.permission))
    )
  );

  if (!isHydrated || isAuthLoading) return <Loading label="Cargando usuario..." />;

  if (!user || !routeConfig || !canAccessRoute(user, routeConfig)) {
    // mientras redirige o si no puede, no muestra la pantalla
    return null;
  }

  if (!canViewSummary) {
    return (
      <div className="app-atmosphere relative h-full flex flex-col px-6 py-6 lg:px-10 rounded-[40px] overflow-hidden">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <div className="flex items-center gap-5">
            <div className="bg-white/15 p-3 rounded-2xl backdrop-blur-md border border-white/20">
              <LayoutDashboard className="h-8 w-8 text-slate-900" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
              <p className="text-slate-600 font-medium mt-1">Tienes acceso a la app, pero no al resumen central del dashboard.</p>
            </div>
          </div>

          <div className="glass-card rounded-[40px] p-8 border border-white/40 shadow-2xl">
            <p className="text-slate-700 font-medium">
              El backend responde 403 para <span className="font-bold">/dashboard/summary</span>. Eso significa que tu usuario no tiene el permiso <span className="font-bold">dashboard:read</span>.
            </p>
            <p className="text-slate-600 mt-3">
              Puedes seguir entrando a los módulos que sí estén permitidos desde el sidebar, incluido Inventory si tu rol tiene algún permiso de ese módulo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-atmosphere relative h-full flex flex-col px-6 py-6 lg:px-10 rounded-[40px] overflow-hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        
        {/* HEADER */}
        <div className="flex items-center gap-5">
          <div className="bg-white/15 p-3 rounded-2xl backdrop-blur-md border border-white/20">
            <LayoutDashboard className="h-8 w-8 text-slate-900" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-600 font-medium mt-1">Current system and inventory status.</p>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredStats.map((stat, index) => (
            <div key={index} className="glass-card group p-6 rounded-[35px] border border-white/40 shadow-xl transition hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.color} p-3 rounded-2xl shadow-inner`}>
                  {stat.icon}
                </div>
                <ArrowUpRight className="text-slate-300 group-hover:text-slate-600 transition-colors" size={20} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.title}</p>
              <h2 className="text-4xl font-black text-slate-900 mt-1">{stat.value}</h2>
              <p className="text-xs font-bold text-slate-500 mt-2">{stat.subtitle}</p>
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LOW STOCK PRODUCTS */}
          <div className="glass-card rounded-[40px] p-8 border border-white/40 shadow-2xl flex flex-col h-[290px]">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="text-rose-500" size={28} />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Low Stock Products</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-3 space-y-4 custom-scrollbar">
              {summary.lowStockProducts.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 font-bold italic">
                  All inventory is up to date
                </div>
              ) : (
                summary.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between bg-white/20 border border-white/30 rounded-[24px] p-5 transition hover:bg-white/40">
                    <div>
                      <p className="font-black text-slate-900">{product.nombre}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-rose-600 font-black text-xl">{product.stock}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Units</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="glass-card rounded-[40px] p-8 border border-white/40 shadow-2xl flex flex-col h-[290px]">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-emerald-500" size={28} />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Activity</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-3 space-y-4 custom-scrollbar">
              {summary.recentAudit.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 font-bold italic">
                  No recent activity found
                </div>
              ) : (
                summary.recentAudit.map((activity) => (
                  <div key={activity.id} className="bg-white/20 border border-white/30 rounded-[24px] p-5 flex items-center gap-4 transition hover:bg-white/40">
                    <div className="flex-1 text-sm">
                      <p className="text-slate-800 leading-snug">
                        <span className="font-black text-slate-900">{activity.usuario}</span>
                        {" performed "}
                        <span className="font-bold text-indigo-600">{activity.action.toLowerCase()}</span>
                        {" on "}
                        <span className="font-bold">{activity.resource}</span>
                      </p>
                      <p className="text-[10px] font-black text-slate-400 mt-1 uppercase">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}