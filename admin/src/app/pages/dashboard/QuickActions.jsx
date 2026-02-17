import { CalendarPlus, Ban, UserPlus, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Slot Allocation",
      icon: CalendarPlus,
      color: "bg-green-700",
      onClick: () =>
        navigate("/admin/facilities", {
          state: { tab: "slots" },
        }),
    },
    {
      label: "Block Slots",
      icon: Ban,
      color: "bg-red-600",
      onClick: () =>
        navigate("/admin/facilities", {
          state: { tab: "blocked" },
        }),
    },
    {
      label: "New Enrollment",
      icon: UserPlus,
      color: "bg-green-700",
      onClick: () => navigate("/admin/enrollments"),
    },
    {
      label: "Rent Facility",
      icon: FileText,
      color: "bg-orange-500 text-gray-800",
      onClick: () =>
        navigate("/admin/turf-rentals", {
          state: { tab: "turf-rental" },
        }),
    },
  ];

  return (
    <div className="bg-white border rounded-xl p-5">
      <h2 className="font-semibold mb-3">Quick Actions</h2>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={a.onClick}
            className={`flex items-center justify-center gap-2 h-12 rounded-xl font-medium transition
              ${a.color} text-white hover:opacity-90`}
          >
            <a.icon className="w-3 h-3" />
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
