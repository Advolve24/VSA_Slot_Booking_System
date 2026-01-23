// src/app/layout/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="p-6 overflow-hidden">
          <Outlet />   {/* ✅ THIS IS THE KEY */}
        </main>
      </div>
    </div>
  );
}
