import {
  User,
  CalendarCheck,
  Trophy,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";

export default function UserMenu({ onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();

  if (!user) return null;

  const initial = user.fullName?.charAt(0)?.toUpperCase() || "U";

  return (
    <div
      role="menu"
      className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden"
      onClick={(e) => e.stopPropagation()} // 🔥 IMPORTANT
    >
      {/* USER HEADER */}
      <div className="flex items-center gap-3 p-4 bg-gray-50">
        <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg">
          {initial}
        </div>

        <div className="min-w-0">
          <p className="font-semibold truncate">{user.fullName}</p>
          <p className="text-xs text-gray-600 truncate">
            {user.email || user.mobile || "—"}
          </p>
        </div>
      </div>

      {/* MENU */}
      {/* MENU */}
      <div className="py-2">
        <MenuItem
          icon={User}
          label="My Account"
          onClick={() => {
            onClose();
            navigate("/account");
          }}
        />

        <MenuItem
          icon={CalendarCheck}
          label="My Enrollments"
          onClick={() => {
            onClose();
            navigate("/my-enrollments");
          }}
        />

        <MenuItem
          icon={Trophy}
          label="My Turf Bookings"
          onClick={() => {
            onClose();
            navigate("/my-turf-bookings");
          }}
        />
      </div>


      {/* LOGOUT */}
      <div className="border-t">
        <button
          onClick={() => {
            logout();
            onClose();
            navigate("/", { replace: true });
          }}
          className="w-full px-4 py-3 flex gap-3 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 flex gap-3 text-sm hover:bg-gray-100"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
