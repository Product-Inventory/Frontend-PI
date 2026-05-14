"use client";
import { useEffect, useState } from "react";
import { Users, Package, Boxes, Truck, AlertTriangle, Activity, BarChart3, LayoutDashboard } from "lucide-react";
import Loading from "@/components/ui/Loading";
import { dashboardService } from "@/services/dashboard.service";
import { DashboardSummary } from "@/types/dashboard";

export default function DashboardPage() {

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data =
        await dashboardService.getSummary();
      setSummary(data);
    } catch (error) {
      console.error(
        "Error loading dashboard:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!summary) {
    return (
      <p className="text-gray-500">
        Failed to load dashboard
      </p>
    );
  }

  const stats = [
    {
      title: "Users",
      value: summary.totals.users,
      subtitle: `${summary.totals.activeUsers} active users`,
      icon: <Users size={18} />,
    },

    {
      title: "Products",
      value: summary.totals.products,
      subtitle: `${summary.lowStockCount} low stock`,
      icon: <Package size={18} />,
    },

    {
      title: "Suppliers",
      value: summary.totals.suppliers,
      subtitle: `${summary.totals.activeSuppliers} active suppliers`,
      icon: <Boxes size={18} />,
    },

    {
      title: "Receptions",
      value: summary.totals.recepciones,
      subtitle: "Recent receptions",
      icon: <Truck size={18} />,
    },
  ];

  const chartData = summary.recentAudit.slice(0, 7).reverse().map((item, index) => ({
      name: `#${index + 1}`,
      movements: index + 2,
    }));

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto pr-1">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-4">
          <div className="bg-white/25 backdrop-blur-md p-3 rounded-2xl">
            <LayoutDashboard
              className="h-7 w-7 text-gray-800"
            />
          </div>
          <div>
            <h1 className="text-4xl font-semibold text-gray-800 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              General system overview
            </p>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card rounded-2xl p-5 min-h-[130px] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-white/30 flex items-center justify-center text-gray-800">
                {stat.icon}
              </div>

              <BarChart3
                size={16}
                className="text-gray-400"
              />
            </div>

            <div className="mt-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {stat.title}
              </p>
              <h2 className="text-4xl font-bold text-gray-800 leading-none mt-1">
                {stat.value}
              </h2>
              <p className="text-sm text-cyan-700 mt-2">
                {stat.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* LOW STOCK */}
        <div className="glass-card rounded-2xl p-5 h-[340px] min-h-0 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle
              size={20}
              className="text-red-400"
            />
            <h2 className="text-2xl font-semibold text-gray-800">
              Low Stock Products
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
            {summary.lowStockProducts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No low stock products
              </div>
            ) : (

              summary.lowStockProducts.map((product) => (
                <div key={product.id} className="bg-white/30 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">
                      {product.nombre}
                    </p>
                    <p className="text-sm text-gray-500">
                      Minimum stock: {product.stockMinimo}
                    </p>
                  </div>
                  <div className="bg-red-100 text-red-500 px-3 py-1 rounded-xl text-sm font-semibold">
                    {product.stock} units
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="glass-card rounded-2xl p-5 h-[340px] min-h-0 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <Activity
              size={20}
              className="text-cyan-500"
            />
            <h2 className="text-2xl font-semibold text-gray-800">
              Recent Activity
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
            {summary.recentAudit.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No recent activity
              </div>
            ) : (

              summary.recentAudit.map((activity) => (
                <div key={activity.id} className="bg-white/30 rounded-2xl p-4 flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-cyan-500"/>
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">
                        {activity.usuario}
                      </span>{" "}
                      {activity.action.toLowerCase()}{" "}
                      {activity.resource}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(
                        activity.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CHART */}     
    </div>
  );
}