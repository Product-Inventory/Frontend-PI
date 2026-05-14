"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import Loading from "@/components/ui/Loading";
import { auditService } from "@/services/audit.service";
import { AuditLog } from "@/types/audit";
import { ClipboardList } from "lucide-react";

export default function AuditPage() {

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

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

  // PAGINATION

  const totalPages = Math.ceil(
    logs.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const paginatedLogs =
    logs.slice(startIndex, endIndex);

  // TABLE COLUMNS

  const columns = [
    {
      header: "User",
      accessor: "usuario" as const,
    },

    {
      header: "Action",
      accessor: "action" as const,
    },

    {
      header: "Resource",
      accessor: "resource" as const,
    },

    {
      header: "Details",
      render: (row: AuditLog) => (
        <div className="max-w-[350px] truncate text-xs text-gray-500">
          {Object.entries(row.details || {})
            .map(([key, value]) => `${key}: ${value}`)
            .join(" • ")}
        </div>
      ),
    },

    {
      header: "Date",
      render: (row: AuditLog) =>
        new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}

      <div>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2 rounded-md flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-black" />
          </div>
          <h1 className="text-4xl font-semibold text-gray-800 tracking-tight">
            Audit Logs
          </h1>
        </div>
        <p className="text-gray-500 mt-1">
          System activity and user actions
        </p>
      </div>

      {/* TABLE */}

      {isLoading ? (

        <Loading />

      ) : (

        <div className="glass-card rounded-2xl p-6 h-[650px] flex flex-col">

          <div className="overflow-y-auto flex-1">

            <DataTable
              columns={columns}
              data={paginatedLogs}
            />

          </div>

          {/* PAGINATION */}

          <div className="flex justify-between items-center mt-4">

            <p className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex gap-2">

              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.max(p - 1, 1)
                  )
                }
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50"
              >
                Previous
              </button>

              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(p + 1, totalPages)
                  )
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm disabled:opacity-50"
              >
                Next
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}