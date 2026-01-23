import { Home, Users, Calendar, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white border-t shadow-inner flex justify-around py-2">
      <MobileItem to="/" icon={<Home />} />
      <MobileItem to="/enrollments" icon={<Users />} />
      <MobileItem to="/bookings" icon={<Calendar />} />
      <MobileItem to="/settings" icon={<Settings />} />
    </nav>
  );
}

function MobileItem({ to, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `p-2 ${isActive ? "text-green-700" : "text-gray-500"}`
      }
    >
      {icon}
    </NavLink>
  );
}
