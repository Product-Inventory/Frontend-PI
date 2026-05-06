"use client";
import '@fortawesome/fontawesome-free/css/all.min.css';
import React, { useState } from "react";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-atmosphere min-h-screen w-full flex flex-col">
      <div className="flex flex-1">
        <main className="flex-1 p-4 sm:p-8 transition-all duration-200">
          <div className="app-shell rounded-2xl shadow-lg p-4 sm:p-8 min-h-[calc(100vh-64px)]">
            {/* <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {/* <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} /> */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}