"use client";
import '@fortawesome/fontawesome-free/css/all.min.css';
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from './Navbar';

export default function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-atmosphere min-h-screen w-full flex flex-col">
      <div className="flex min-h-screen flex-1 items-stretch">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex min-h-screen flex-1 flex-col p-4 sm:p-8 transition-all duration-200">
          <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
          <div className="app-shell flex flex-1 flex-col rounded-2xl shadow-lg p-4 sm:p-8 min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}