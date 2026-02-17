import { useState, useRef, useEffect } from "react";
import { LogIn, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import SignInModal from "@/pages/SignInModal";
import UserMenu from "@/components/UserMenu";
import { Link } from "react-router-dom";


export default function Header() {
  const { user } = useUserStore();
  const [openAuth, setOpenAuth] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const wrapperRef = useRef(null);

  /* ✅ SINGLE OUTSIDE CLICK HANDLER */
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header className="w-full border-b bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-4">
          {/* LOGO */}
          <Link to="/" className="flex gap-3 items-center group">
            <img
              src="/VSA-Logo-1.png"
              className="w-14 h-14 object-contain"
              alt="Vidyanchal Sports Academy"
            />

            <div className="hidden sm:block">
              <h1 className="font-semibold text-green-800 group-hover:text-green-700 transition">
                Vidyanchal Sports Academy
              </h1>
              <p className="text-xs text-gray-600">
                Excellence in Sports Training
              </p>
            </div>
          </Link>


          {/* AUTH */}
          <div ref={wrapperRef} className="relative">
            {!user ? (
              <Button className="bg-green-700 hover:bg-green-800" onClick={() => setOpenAuth(true)}>
                <LogIn className="w-4 h-4 mr-2" /> Sign In
              </Button>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenu((v) => !v);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full"
                >
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                    {user.fullName?.[0] || "U"}
                  </div>
                  <ChevronDown className={`w-4 h-4 ${openMenu ? "rotate-180" : ""}`} />
                </button>

                {openMenu && <UserMenu onClose={() => setOpenMenu(false)} />}
              </>
            )}
          </div>
        </div>
      </header>

      <SignInModal open={openAuth} onClose={() => setOpenAuth(false)} />
    </>
  );
}
