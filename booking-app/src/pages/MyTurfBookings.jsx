import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  X,
  Calendar,
  Trophy,
  Clock,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";

/* ================= SAFE DATE ================= */
function safeDate(d) {
  if (!d) return null;
  const str = String(d);
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  return new Date(str);
}

function fmt(d, pattern = "dd MMM yyyy") {
  const dt = safeDate(d);
  return dt ? format(dt, pattern) : "-";
}

/* ================= TIME FORMAT (FIXED AM/PM) ================= */
function formatTime12h(time) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const hour12 = h % 12 || 12;
  const suffix = h >= 12 ? "PM" : "AM";
  return m === 0
    ? `${hour12} ${suffix}`
    : `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export default function MyTurfBookings() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/users/my-turf-bookings");
        setBookings(res.data || []);
      } catch {
        toast({
          variant: "destructive",
          title: "Failed to load bookings",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return <div className="py-16 text-center">Loading...</div>;

  return (
    <>
      {/* ================= TABLE SECTION ================= */}
      <div className="max-w-6xl mx-auto py-6 px-4">
        <h1 className="text-xl font-semibold mb-4 text-green-800">
          My Turf Bookings
        </h1>

        {bookings.length === 0 ? (
          <div className="bg-white border rounded-lg p-6 text-center text-gray-500 shadow-sm">
            No turf bookings found.
          </div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-3">Facility</th>
                    <th className="p-3">Sport</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((item) => {
                    const statusColor =
                      item.bookingStatus === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : item.bookingStatus === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700";

                    return (
                      <tr
                        key={item._id}
                        className="border-t hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => setSelectedBooking(item)}
                      >
                        <td className="p-3 font-medium">
                          {item.facilityName}
                        </td>

                        <td className="p-3">
                          {item.sportName}
                        </td>

                        <td className="p-3">
                          {fmt(item.rentalDate)}
                        </td>

                        <td className="p-3 font-medium text-green-700">
                          ₹{item.finalAmount ?? item.totalAmount}
                        </td>

                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusColor}`}
                          >
                            {item.bookingStatus}
                          </span>
                        </td>

                        <td
                          className="p-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBooking(item)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ================= DETAILS MODAL ================= */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 relative">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </button>

            {/* HEADER */}
            <h2 className="text-lg font-semibold text-green-800 mb-1">
              {selectedBooking.facilityName}
            </h2>

            <p className="text-xs text-gray-500 mb-3">
              Booking ID: {selectedBooking._id}
            </p>

            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[11px] mb-4 capitalize">
              <CheckCircle className="w-3 h-3" />
              {selectedBooking.bookingStatus}
            </span>

            <div className="border-t mb-4"></div>

            {/* ================= INFO GRID ================= */}
            <div className="space-y-4 text-sm">

              {/* DATE */}
              <div className="flex gap-2">
                <Calendar className="text-green-700 w-4 h-4 mt-1" />
                <div>
                  <p className="font-medium">
                    {fmt(selectedBooking.rentalDate)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Booking Date
                  </p>
                </div>
              </div>

              {/* SPORT + FACILITY IN ONE ROW */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <Trophy className="text-green-700 w-4 h-4 mt-1" />
                  <div>
                    <p className="font-medium">
                      {selectedBooking.sportName}
                    </p>
                    <p className="text-xs text-gray-500">Sport</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <MapPin className="text-green-700 w-4 h-4 mt-1" />
                  <div>
                    <p className="font-medium">
                      {selectedBooking.facilityName}
                    </p>
                    <p className="text-xs text-gray-500">Facility</p>
                  </div>
                </div>
              </div>

              {/* SLOTS */}
              <div className="flex gap-2">
                <Clock className="text-green-700 w-4 h-4 mt-1" />
                <div>
                  <p className="font-medium mb-1">Booked Slots</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.slotLabels?.map((slot, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            <div className="border-t my-4"></div>

            {/* ================= AMOUNT SECTION ================= */}
            <div className="space-y-2 text-sm">

              <div className="flex justify-between">
                <span>Duration</span>
                <span>
                  {selectedBooking.durationHours}{" "}
                  {selectedBooking.durationHours === 1
                    ? "hour"
                    : "hours"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Rate</span>
                <span>₹{selectedBooking.hourlyRate}</span>
              </div>

              {selectedBooking.totalDiscountAmount > 0 && (
                <div className="flex justify-between text-green-600 text-xs">
                  <span>Discount</span>
                  <span>- ₹{selectedBooking.totalDiscountAmount}</span>
                </div>
              )}

              <div className="border-t pt-2 flex justify-between font-semibold text-base text-green-700">
                <span>Total Amount</span>
                <span>
                  ₹{selectedBooking.finalAmount ?? selectedBooking.totalAmount}
                </span>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
