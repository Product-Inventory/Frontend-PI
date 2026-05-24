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

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

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

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full rounded-full border border-white/50 bg-white/35 py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-500 outline-none backdrop-blur-sm transition focus:border-indigo-500 focus:bg-white/50 shadow-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <div className="glass-card flex flex-col rounded-[45px] overflow-hidden shadow-2xl border border-white/40">
            
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full table-fixed text-left border-collapse text-sm">
                <thead className="bg-white/10">
                  <tr className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                    <th className="w-1/5 px-8 py-6">User</th>
                    <th className="w-1/5 px-8 py-6">Action</th>
                    <th className="w-auto px-16 py-6">Resource</th>
                    <th className="w-72 px-8 py-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log, idx) => (
                      <tr key={idx} className="group transition hover:bg-white/10">
                        <td className="px-8 py-5 font-black text-slate-800 break-words">{log.usuario}</td>
                        <td className="px-8 py-5 font-bold text-slate-700 break-words">{log.action}</td>
                        <td className="px-16 py-5">
                          <span className="rounded-full bg-indigo-100/50 border border-indigo-200/50 px-4 py-1.5 text-[10px] font-black text-indigo-700 uppercase tracking-widest block w-fit break-all">
                            {log.resource}
                          </span>
                        </td>
                        <td className="px-8 py-5 font-medium text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('en', { 
                            day: '2-digit', month: '2-digit', year: 'numeric', 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-10 text-center text-sm text-slate-500">
                        No logs found matching "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 md:hidden">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log, idx) => (
                  <article key={idx} className="rounded-3xl border border-white/45 bg-white/35 p-4 shadow-sm">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">USER</p>
                        <p className="text-lg font-extrabold text-slate-900 break-words">{log.usuario}</p>
                      </div>
                      <span className="rounded-full bg-indigo-100/50 border border-indigo-200/50 px-3 py-1 text-[9px] font-black text-indigo-700 uppercase tracking-widest max-w-[150px] break-all text-center">
                        {log.resource}
                      </span>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">ACTION</p>
                      <p className="text-sm font-semibold text-slate-800 break-words">{log.action}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/20 flex justify-between items-center">
                      <span className="text-[11px] font-medium text-slate-500">
                        {new Date(log.createdAt).toLocaleString('en', { 
                          day: '2-digit', month: '2-digit', year: 'numeric', 
                          hour: '2-digit', minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-center py-6 text-sm text-slate-500">
                  No logs found matching "{searchTerm}"
                </p>
              )}
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