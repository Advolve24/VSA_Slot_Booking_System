import { Clock, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function UpcomingSlots({ slots = [] }) {
  const navigate = useNavigate();

  const visibleSlots = slots.slice(0, 2);
  const hasMore = slots.length > 2;

  /* ================= FORMAT TIME ================= */

  const formatTime12h = (time) => {
    if (!time) return "";

    const [h, m] = time.split(":").map(Number);
    const hour12 = h % 12 || 12;
    const suffix = h >= 12 ? "PM" : "AM";

    return m === 0
      ? `${hour12} ${suffix}`
      : `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
  };

  const formatRange = (slotArray = []) => {
    if (!slotArray.length) return "";

    const sorted = [...slotArray].sort();

    const start = formatTime12h(sorted[0]);

    const [h, m] = sorted[sorted.length - 1]
      .split(":")
      .map(Number);

    const endHour = h + 1;

    const end = formatTime12h(
      `${endHour.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`
    );

    return `${start} – ${end}`;
  };

  return (
    <div className="bg-white border rounded-xl p-5">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-semibold">Upcoming Slots</h2>
          <p className="text-xs text-muted-foreground">
            Next 3 days
          </p>
        </div>

        <span className="text-green-600 text-sm font-medium">
          {slots.length} slots
        </span>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {visibleSlots.map((s) => (
          <div
            key={s._id}
            className="flex justify-between bg-gray-50 rounded-lg p-4"
          >
            <div>
              {/* DATE */}
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(s.rentalDate), "dd MMM yyyy")}
              </p>

              {/* TIME (UPDATED TO 12H FORMAT) */}
              <p className="font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatRange(s.slots)}
              </p>

              {/* FACILITY */}
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                {s.facilityName}
              </p>
            </div>

            {/* STATUS */}
            <span
              className={`text-xs px-3 py-1 h-fit rounded-full capitalize
                ${
                  s.bookingStatus === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : s.bookingStatus === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-200 text-gray-700"
                }`}
            >
              {s.bookingStatus}
            </span>
          </div>
        ))}

        {/* EMPTY STATE */}
        {!slots.length && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No upcoming slots
          </p>
        )}
      </div>

      {/* VIEW MORE BUTTON */}
      {hasMore && (
        <div className="mt-5 text-center">
          <button
            onClick={() => navigate("/admin/turf-rentals")}
            className="text-sm font-medium text-green-700 hover:text-green-800 hover:underline transition"
          >
            View More →
          </button>
        </div>
      )}
    </div>
  );
}
