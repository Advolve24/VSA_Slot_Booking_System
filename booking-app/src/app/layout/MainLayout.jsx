// src/app/layout/MainLayout.jsx
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9faf9]">
      <Header />
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>

      <Footer />
    </div>
  );
}
