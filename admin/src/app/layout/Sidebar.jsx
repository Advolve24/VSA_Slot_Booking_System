import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Grid,
  Layers,
  Building2,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Trophy,
} from "lucide-react";

const menu = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Enrollments", to: "/admin/enrollments", icon: Users },
  { label: "Bookings", to: "/admin/bookings", icon: Calendar },
  { label: "Turf Rentals", to: "/admin/turf-rentals", icon: Grid },

  // ✅ NEW: SPORTS CRUD
  { label: "Sports", to: "/admin/sports", icon: Trophy },

  { label: "Coaching Batches", to: "/admin/batches", icon: Layers },
  { label: "Facilities", to: "/admin/facilities", icon: Building2 },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ================= MOBILE TOP BAR ================= */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0F6B2F] text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center font-bold">
            V
          </div>
          <span className="font-semibold">VSA Admin</span>
        </div>

        <button onClick={() => setMobileOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* ================= OVERLAY (MOBILE) ================= */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed md:static z-50 top-0 left-0
          bg-[#0F6B2F] text-white flex flex-col min-h-screen
          transition-all duration-300
          ${collapsed ? "md:w-20" : "md:w-64"}
          ${
            mobileOpen
              ? "w-64 translate-x-0"
              : "w-64 -translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between px-4 py-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold">
              V
            </div>

            {!collapsed && (
              <span className="ml-3 text-lg font-semibold">VSA Admin</span>
            )}
          </div>

          {/* Close button (mobile) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-2 space-y-1">
          {menu.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-3 py-3 rounded-lg
                transition-all duration-200
                ${
                  isActive
                    ? "bg-green-700 text-white"
                    : "text-green-100 hover:bg-green-700/60"
                }
                ${collapsed ? "md:justify-center" : ""}
                `
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* COLLAPSE BUTTON (DESKTOP ONLY) */}
        <div className="hidden md:block border-t border-green-800 px-3 py-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 text-green-100 hover:text-white transition"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
