"use client";

import { useEffect, useState } from "react";
import { ordersService } from "@/services/orders.service";
import type { Order } from "@/types/order";
import { Loading } from "@/components/ui/Loading";
import { Toast } from "@/components/ui/Toast";
import { ClipboardList, Plus } from "lucide-react";

const itemsPerPage = 10;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showPagination = totalItems > itemsPerPage;

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await ordersService.getAll({
        q: search,
        page: currentPage,
        limit: itemsPerPage,
      });
      setOrders(data.items || []);
      setTotalItems(data.total || 0);
      setTotalPages(Math.max(1, Math.ceil((data.total || 0) / (data.limit || itemsPerPage))));
    } catch (error: any) {
      setToast({ message: "Error loading orders", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchOrders();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search, currentPage]);
  useEffect(() => { setCurrentPage(1); }, [search]);
  useEffect(() => { setCurrentPage((page) => Math.min(page, totalPages)); }, [totalPages]);

  const buttonBase = "inline-flex h-10 items-center justify-center rounded-full border border-white/50 bg-white/35 px-4 text-sm font-semibold !text-[#9a7ef0] shadow-[0_6px_18px_rgba(138,108,198,0.14)] transition hover:-translate-y-0.5 hover:bg-white/50";

  return (
    <div className="app-atmosphere min-h-full px-6 py-6 lg:px-10">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6">
        {toast && (
          <Toast message={toast.message} type={toast.type} duration={1000} onClose={() => setToast(null)} />
        )}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-md flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                Orders
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Sales and orders registry.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:min-w-[31rem]">
            <div className="flex items-center justify-between mt-3 gap-3">
              <span className="glass-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                Total: {totalItems}
              </span>
              <button onClick={() => setToast({ message: "Todo: crear modal de nueva orden pronto", type: "success" })} className={buttonBase}>
                <Plus className="mr-2 h-4 w-4" />
                Create
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Loading label="Loading orders..." />
        ) : (
          <div className="glass-card overflow-hidden rounded-[30px]">
            <div className="hidden md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-white/25">
                  <tr className="text-left text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                    <th className="px-5 py-4">Folio</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Client</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="border-t border-white/18 transition hover:bg-white/10">
                        <td className="px-5 py-5 font-extrabold text-slate-800">{order.folio}</td>
                        <td className="px-5 py-5 text-slate-700">{order.fecha}</td>
                        <td className="px-5 py-5 text-slate-700">{order.clienteNombre}</td>
                        <td className="px-5 py-5">{order.status}</td>
                        <td className="px-5 py-5 font-semibold text-slate-800">${order.total.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-14 text-center text-slate-500">
                        No orders registered
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Mobile version */}
            <div className="grid gap-4 p-4 md:hidden">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <article key={order.id} className="rounded-[24px] border border-white/45 bg-white/35 p-4 shadow-[0_8px_20px_rgba(138,108,198,0.12)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-slate-500 mb-1">Folio</p>
                        <p className="font-extrabold text-slate-900">{order.folio}</p>
                      </div>
                      <span className="rounded-full px-3 py-1 text-xs font-bold bg-slate-200/80 text-slate-600">
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <OrderMeta label="Client" value={order.clienteNombre} />
                      <OrderMeta label="Date" value={order.fecha} />
                      <OrderMeta label="Total" value={`$${order.total.toLocaleString()}`} />
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/45 bg-white/35 px-4 py-10 text-center text-slate-500">
                  No orders registered
                </div>
              )}
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 border-t border-white/20 px-5 pt-4">
              <p className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={!showPagination || currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm !text-[#9a7ef0] disabled:opacity-20"
                >Previous</button>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                  disabled={!showPagination || currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm !text-[#9a7ef0] disabled:opacity-20"
                >Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/25 px-3 py-2">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}