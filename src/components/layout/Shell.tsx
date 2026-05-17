"use client";
import '@fortawesome/fontawesome-free/css/all.min.css';
import React, { useState } from "react";
import { Box } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      className="app-atmosphere min-h-screen w-full flex flex-col overflow-hidden"
      style={{
        ["--sidebar-width" as string]: "clamp(16rem, 18vw, 17.5rem)",
      }}
    >
      <div className="flex min-h-screen flex-1 items-stretch overflow-visible relative">
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="fixed left-3 top-3 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/65 text-purple-500 shadow-[0_10px_28px_rgba(58,72,145,0.18)] backdrop-blur-xl transition-transform transition-colors hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-[0_14px_34px_rgba(58,72,145,0.22)] cursor-pointer sm:left-4 sm:top-4"
            aria-label="Open sidebar"
          >
            <Box size={26} />
          </button>
        )}
        
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`relative z-0 flex min-h-screen flex-1 flex-col pr-4 pt-16 pb-4 sm:pr-5 sm:pt-20 sm:pb-5 transition-all duration-300 rounded-[40px] overflow-hidden ${sidebarOpen ? 'pl-[var(--sidebar-width)]' : 'pl-16 sm:pl-20'}`}>
          <div className="app-shell flex flex-1 flex-col rounded-[40px] shadow-lg p-0 sm:p-1 min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}