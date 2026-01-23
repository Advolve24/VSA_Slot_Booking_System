// src/app/layout/Topbar.jsx
import { useAuth } from "../providers/AuthProvider";
import { LogOut } from "lucide-react";

export default function Topbar() {
  const { logout, admin } = useAuth();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-green-800">
        Welcome, {admin?.fullName || "Admin"}
      </h1>

      <button
        onClick={logout}
        className="flex items-center gap-2 text-red-600 hover:text-red-800"
      >
        <LogOut size={18} /> Logout
      </button>
    </header>
  );
}
