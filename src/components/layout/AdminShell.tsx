import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }) {
  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <div className="flex-1">
        <AdminNavbar />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}