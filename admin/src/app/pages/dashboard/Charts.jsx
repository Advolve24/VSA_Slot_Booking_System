import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

/* ================= COLORS (VSA THEME) ================= */
const COLORS = {
  enrollments: "#15803d", // green-700
  turf: "#f97316",        // orange-500
};

export default function Charts({ stats }) {
  const data = [
    {
      name: "Enrollments",
      value: stats?.totalEnrollments || 0,
      color: COLORS.enrollments,
    },
    {
      name: "Turf Rentals",
      value: stats?.totalTurfRentals || 0,
      color: COLORS.turf,
    },
  ];

  const total =
    (stats?.totalEnrollments || 0) +
    (stats?.totalTurfRentals || 0);

  return (
    <Card className="rounded-xl">
      <CardContent className="p-6">
        {/* HEADER */}
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-green-700">
            Top Category
          </h2>
          <p className="text-sm text-muted-foreground">
            Enrollment vs Turf Rentals (hover to see details)
          </p>
        </div>

        {/* SAFE CHART CONTAINER */}
        <div className="relative w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={data}
                innerRadius={70}
                outerRadius={100}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* CENTER TEXT */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xs text-muted-foreground">
              Total
            </p>
            <p className="text-xl font-bold">
              {total}
            </p>
          </div>
        </div>

        {/* LEGEND */}
        <div className="flex justify-center gap-6  text-sm">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS.enrollments }}
            />
            <span>Enrollments</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS.turf }}
            />
            <span>Turf Rentals</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
