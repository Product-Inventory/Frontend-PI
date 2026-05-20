"use client";
import '@fortawesome/fontawesome-free/css/all.min.css';
import React, { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      className="app-atmosphere min-h-screen w-full flex flex-col overflow-hidden"
      style={{
        ["--sidebar-width" as string]: "272px",
      }}
    >
      {/* Navbar fija arriba */}
      <header
        className="app-topbar"
        style={{ left: sidebarOpen ? "var(--sidebar-width)" : "0" }}
      >
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/65 text-purple-500 shadow cursor-pointer hover:bg-white/80 flex-shrink-0"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
        )}
        <span className="text-xl font-extrabold tracking-tight text-slate-900">Inventory Pro</span>
      </header>

      <div className="flex min-h-screen flex-1 items-stretch overflow-visible relative">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main
          className={`relative z-0 flex min-h-screen flex-1 flex-col pr-4 pt-16 pb-4 sm:pr-5 sm:pb-5 transition-all duration-300 overflow-hidden ${
            sidebarOpen ? "pl-[var(--sidebar-width)]" : "pl-4 sm:pl-5"
          }`}
        >
          <div className="app-shell flex flex-1 flex-col shadow-lg p-0 sm:p-1 min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
