import React from "react";

type NavbarProps = {
  search?: string;
  setSearch?: (v: string) => void;
  moduleFilter?: string;
  setModuleFilter?: (v: string) => void;
  modules?: string[];
  onMenuClick?: () => void;
};

export default function Navbar({
  search = "",
  setSearch = () => {},
  moduleFilter = "all",
  setModuleFilter = () => {},
  modules = ["all"],
  onMenuClick,
}: NavbarProps) {
  return (
    <nav className="h-16 bg-transparent flex flex-col lg:flex-row items-center lg:items-center px-4 sm:px-10 z-30 relative">
      {/* Filtros y búsqueda */}
      <div className="flex gap-4 items-center w-full justify-center lg:justify-start">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72 px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          {(modules || []).map((m) => (
            <option key={m} value={m}>
              {m === "all" ? "All" : m}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}