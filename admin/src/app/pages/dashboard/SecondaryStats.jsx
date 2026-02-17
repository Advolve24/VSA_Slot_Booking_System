import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock } from "lucide-react";

export default function SecondaryStats({ stats, loading }) {
  const items = [
    {
      title: "Total Turf Rentals",
      value: stats?.totalTurfRentals ?? 0,
      icon: BarChart3,
    },
    {
      title: "Total Revenue",
      value: stats?.totalRevenue ? `₹${stats.totalRevenue}` : null,
      icon: TrendingUp,
    },
    {
      title: "Turf Utilization",
      value: stats?.turfUtilization
        ? `${stats.turfUtilization}%`
        : null,
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item, i) => (
        <Card key={i} className="hover:shadow-sm transition">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">{item.title}</p>
              <h2 className="text-2xl font-semibold mt-1">
                {loading ? "—" : item.value ?? 0}
              </h2>
            </div>
            <item.icon className="w-6 h-6 text-muted-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
