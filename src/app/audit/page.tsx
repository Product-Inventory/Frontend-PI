"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/ui/Loading";
import { auditService } from "@/services/audit.service";
import { AuditLog } from "@/types/audit";
import { ClipboardList, Search, ChevronLeft, ChevronRight } from "lucide-react";

const itemsPerPage = 5;

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await auditService.getAll();
      setLogs(data.items || []);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginationBtnBase = "flex h-11 w-11 items-center justify-center rounded-full border border-white/45 bg-white/30 shadow-lg backdrop-blur-md transition hover:bg-white/50 disabled:opacity-20 disabled:hover:translate-y-0 active:scale-95";

  return (
    <div className="app-atmosphere relative min-h-full px-6 py-6 lg:px-10 rounded-[40px] overflow-hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-white/15 p-3 rounded-2xl backdrop-blur-md border border-white/20">
              <ClipboardList className="h-7 w-7 text-slate-800" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                Audit Logs
              </h1>
              <p className="text-slate-600 font-medium mt-1">
                Track and monitor all system activities and user actions.
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full pl-12 h-12 rounded-2xl bg-white/20 border-white/30 placeholder:text-slate-400 focus:bg-white/40 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <div className="glass-card flex flex-col rounded-[45px] overflow-hidden shadow-2xl border border-white/40">
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/10">
                  <tr className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                    <th className="px-8 py-6">User</th>
                    <th className="px-8 py-6">Action</th>
                    <th className="px-8 py-6">Resource</th>
                    <th className="px-8 py-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {paginatedLogs.map((log, idx) => (
                    <tr key={idx} className="group transition hover:bg-white/10">
                      <td className="px-8 py-5 font-black text-slate-800">{log.usuario}</td>
                      <td className="px-8 py-5 font-bold text-slate-700">{log.action}</td>
                      <td className="px-8 py-5">
                        <span className="rounded-full bg-indigo-100/50 border border-indigo-200/50 px-4 py-1.5 text-[10px] font-black text-indigo-700 uppercase tracking-widest">
                          {log.resource}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-medium text-slate-500">
                        {new Date(log.createdAt).toLocaleString('en', { 
                          day: '2-digit', month: '2-digit', year: 'numeric', 
                          hour: '2-digit', minute: '2-digit' 
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-auto flex items-center justify-between bg-white/5 px-8 py-6 border-t border-white/20">
              <p className="text-sm font-bold text-slate-500">
                Page <span className="text-slate-900">{currentPage}</span> of {totalPages}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-2xl border border-gray-200 bg-white products-violet-black-button disabled:opacity-20"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-2xl border border-gray-200 bg-white products-violet-black-button disabled:opacity-20"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}