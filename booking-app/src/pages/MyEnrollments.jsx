import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  X,
  Calendar,
  Trophy,
  Clock,
  User,
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

/* ================= TIME FORMAT ================= */
function formatTime12h(time) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const hour12 = h % 12 || 12;
  const suffix = h >= 12 ? "PM" : "AM";
  return m === 0
    ? `${hour12} ${suffix}`
    : `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export default function MyEnrollments() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/users/my-enrollments");
        setEnrollments(res.data || []);
      } catch {
        toast({
          variant: "destructive",
          title: "Failed to load enrollments",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const rows = useMemo(() => enrollments || [], [enrollments]);

  if (loading) return <div className="py-20 text-center">Loading...</div>;

  return (
    <>
      <div className="max-w-6xl mx-auto py-4 px-4">
        <h1 className="text-xl font-semibold mb-2 text-green-800">
          My Enrollments
        </h1>

        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-2">Sport</th>
                  <th className="p-2">Batch</th>
                  <th className="p-2">Schedule</th>
                  <th className="p-2">Enrolled On</th>
                  <th className="p-2">Batch Duration</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      No enrollments found
                    </td>
                  </tr>
                )}

                {rows.map((en) => {
                  const batch = en.batchId;

                  return (
                    <tr
                      key={en._id}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelected(en)}
                    >
                      <td className="p-4 font-medium">
                        {en.sportName || "-"}
                      </td>

                      <td className="p-4">
                        {en.batchName || batch?.name || "-"}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col text-xs">
                          <span className="text-gray-700 font-medium">
                            {batch?.schedule || "-"}
                          </span>

                          {en.slotLabel && (
                            <span className="text-green-600 font-semibold mt-1">
                              {en.slotLabel}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        {fmt(en.createdAt, "dd-MM-yyyy")}
                      </td>

                      <td className="p-4">
                        {fmt(batch?.startDate, "dd-MM-yyyy")} to{" "}
                        {fmt(batch?.endDate, "dd-MM-yyyy")}
                      </td>

                      <td
                        className="p-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelected(en)}
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
      </div>

      {/* ================= MODAL ================= */}
      {selected && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 relative">

      <button
        onClick={() => setSelected(null)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
      >
        <X className="w-4 h-4" />
      </button>

      {(() => {
        const batch = selected.batchId;

        return (
          <>
            {/* HEADER */}
            <h2 className="text-lg font-semibold text-green-800 mb-1">
              {selected.batchName || batch?.name || "-"}
            </h2>

            <p className="text-xs text-gray-500 mb-3">
              Enrollment ID: {selected._id}
            </p>

            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[11px] mb-4">
              <CheckCircle className="w-3 h-3" />
              Active
            </span>

            <div className="border-t mb-4"></div>

            {/* ================= INFO GRID ================= */}
            <div className="space-y-4 text-sm">

              {/* SPORT + COACH */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <Trophy className="text-green-700 w-4 h-4 mt-1" />
                  <div>
                    <p className="font-medium text-sm">
                      {selected.sportName || "-"}
                    </p>
                    <p className="text-xs text-gray-500">Sport</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <User className="text-green-700 w-4 h-4 mt-1" />
                  <div>
                    <p className="font-medium text-sm">
                      {selected.coachName || batch?.coachName || "-"}
                    </p>
                    <p className="text-xs text-gray-500">Coach</p>
                  </div>
                </div>
              </div>

              {/* SCHEDULE */}
              <div className="flex gap-2">
                <Clock className="text-green-700 w-4 h-4 mt-1" />
                <div>
                  <p className="font-medium text-sm">
                    {batch?.schedule || "-"}
                  </p>

                  {selected.slotLabel && (
                    <div className="text-green-600 text-sm font-semibold">
                      {selected.slotLabel}
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Batch Schedule
                  </p>
                </div>
              </div>

              {/* ENROLLMENT + DURATION */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <Calendar className="text-green-700 w-4 h-4 mt-1" />
                  <div>
                    <p className="font-medium text-sm">
                      {fmt(selected.createdAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Enrollment Date
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Calendar className="text-green-700 w-4 h-4 mt-1" />
                  <div>
                    <p className="font-medium text-sm">
                      {fmt(batch?.startDate)} – {fmt(batch?.endDate)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Batch Duration
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <div className="border-t my-4"></div>

            {/* ================= PLAN & AMOUNT ================= */}
            <div className="space-y-2 text-sm">

              <div className="flex justify-between">
                <span>Plan Type</span>
                <span className="capitalize">
                  {selected.planType || "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Duration</span>
                <span>{selected.durationMonths || 0} month</span>
              </div>

              <div className="border-t pt-3 space-y-1">

                <div className="flex justify-between">
                  <span>Base Amount</span>
                  <span>₹{selected.baseAmount || 0}</span>
                </div>

                {selected.discounts?.length > 0 &&
                  selected.discounts.map((d, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-green-600 text-xs"
                    >
                      <span>
                        {d.title || d.code} (
                        {d.type === "percentage"
                          ? `${d.value}%`
                          : `₹${d.value}`}
                        )
                      </span>
                      <span>- ₹{d.discountAmount}</span>
                    </div>
                  ))}

                {selected.totalDiscountAmount > 0 && (
                  <div className="flex justify-between text-red-600 text-xs">
                    <span>Total Discount</span>
                    <span>- ₹{selected.totalDiscountAmount}</span>
                  </div>
                )}

                <div className="border-t pt-2 flex justify-between font-semibold text-base text-green-700">
                  <span>Total Amount</span>
                  <span>
                    ₹
                    {selected.finalAmount ??
                      selected.totalAmount ??
                      selected.baseAmount ??
                      0}
                  </span>
                </div>

              </div>

            </div>

          </>
        );
      })()}

          </div>
        </div>
      )}
    </>
  );
}
