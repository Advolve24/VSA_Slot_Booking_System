import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const WINDOW_SIZE = 6;

export default function RevenueOverview({ data = [] }) {
  const [startIndex, setStartIndex] = useState(0);

  const totalMonths = data.length;

  const visibleData = useMemo(() => {
    return data.slice(startIndex, startIndex + WINDOW_SIZE);
  }, [data, startIndex]);

  const canPrev = startIndex > 0;
  const canNext = startIndex + WINDOW_SIZE < totalMonths;

  return (
    <Card className="rounded-xl border">
      <CardContent className="p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold text-green-700">
              Revenue Overview
            </h2>
            <p className="text-sm text-muted-foreground">
              Monthly revenue breakdown by category
            </p>
          </div>

          {/* CONTROLS */}
          <div className="flex gap-2">
            <button
              disabled={!canPrev}
              onClick={() => setStartIndex((p) => p - WINDOW_SIZE)}
              className={`p-2 rounded-md border ${
                canPrev
                  ? "hover:bg-gray-100"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              disabled={!canNext}
              onClick={() => setStartIndex((p) => p + WINDOW_SIZE)}
              className={`p-2 rounded-md border ${
                canNext
                  ? "hover:bg-gray-100"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* EMPTY STATE */}
        {visibleData.length === 0 && (
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            No revenue data available
          </div>
        )}

        {/* CHART */}
        {visibleData.length > 0 && (
          <>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visibleData} barGap={10}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tickFormatter={(v) => `₹${v / 1000}k`}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    formatter={(v) => `₹${v}`}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  />

                  <Bar
                    dataKey="coaching"
                    fill="#16a34a"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="turf"
                    fill="#f97316"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* LEGEND */}
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <span className="w-3 h-3 rounded bg-green-600" />
                Coaching
              </div>
              <div className="flex items-center gap-2 text-orange-600">
                <span className="w-3 h-3 rounded bg-orange-500" />
                Turf Rentals
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
