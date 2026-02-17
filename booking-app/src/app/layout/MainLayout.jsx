// src/app/layout/MainLayout.jsx
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useUserStore } from "@/store/userStore";

export default function MainLayout() {
  const hydrate = useUserStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f9faf9]">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
