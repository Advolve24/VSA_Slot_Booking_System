// src/app/layout/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex h-dvh bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto mt-14 sm:mt-0 p-2 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

