import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { IndianRupee } from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/reports").then((res) => setData(res.data));
  }, []);

  if (!data) return null;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-green-800">Reports</h1>
        <p className="text-gray-500">
          View analytics and generate reports for academy operations.
        </p>
      </div>

      {/* REVENUE CARDS */}
      <div className="grid md:grid-cols-3 gap-4">
        <RevenueCard title="Total Revenue" value={data.totalRevenue} />
        <RevenueCard title="Enrollment Revenue" value={data.enrollmentRevenue} />
        <RevenueCard title="Rental Revenue" value={data.rentalRevenue} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* ENROLLMENT BY SPORT */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Enrollments by Sport</h3>

          {data.enrollmentsBySport.map((s) => (
            <BarRow
              key={s.name}
              label={s.name}
              value={`${s.count} (${s.percentage}%)`}
              percentage={s.percentage}
              color="green"
            />
          ))}
        </div>

        {/* BATCH UTILIZATION */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Batch Utilization</h3>

          {data.batchUtilization.map((b) => (
            <BarRow
              key={b.name}
              label={b.name}
              value={`${b.enrolled}/${b.capacity}`}
              percentage={b.percentage}
              color={b.percentage === 100 ? "green" : "orange"}
            />
          ))}
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Quick Stats</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <StatCard label="Total Students" value={data.quickStats.totalStudents} />
          <StatCard label="Turf Rentals" value={data.quickStats.totalTurfRentals} />
          <StatCard label="Active Batches" value={data.quickStats.activeBatches} />
        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

function RevenueCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl border p-5 flex justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold mt-1">
          ₹{value.toLocaleString()}
        </p>
      </div>

      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
        <IndianRupee className="w-5 h-5 text-green-700" />
      </div>
    </div>
  );
}

function BarRow({ label, value, percentage, color }) {
  const barColor =
    color === "green"
      ? "bg-green-700"
      : "bg-orange-500";

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div className="h-3 bg-gray-200 rounded-full">
        <div
          className={`h-3 rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-2xl font-semibold text-green-700">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
