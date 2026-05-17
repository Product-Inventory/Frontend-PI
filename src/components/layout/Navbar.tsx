import React from "react";

type NavbarProps = {
  search?: string;
  setSearch?: (v: string) => void;
  moduleFilter?: string;
  setModuleFilter?: (v: string) => void;
  modules?: string[];
};

export default function Navbar({
  search = "",
  setSearch = () => {},
  moduleFilter = "all",
  setModuleFilter = () => {},
  modules = ["all"],
}: NavbarProps) {
  return (
    <nav className="bg-transparent px-0 sm:px-2 lg:px-4 z-30 relative w-full">
      {/* Filtros y búsqueda */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:justify-start">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full min-w-0 px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 outline-none sm:w-72"
        />

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm sm:w-auto"
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