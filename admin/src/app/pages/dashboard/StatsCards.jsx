import { Card, CardContent } from "@/components/ui/card";
import { Users, Activity, Calendar, IndianRupee } from "lucide-react";

export default function StatsCards({ stats, loading }) {
  const cards = [
    {
      title: "Total Enrollments",
      value: stats?.totalEnrollments ?? 0,
      icon: Users,
      cardBg: "bg-green-50/70",
      iconBg: "bg-green-200",
      iconColor: "text-green-700",
    },
    {
      title: "Active Enrollments",
      value: stats?.activeEnrollments ?? 0,
      icon: Activity,
      cardBg: "bg-emerald-50/70",
      iconBg: "bg-emerald-200",
      iconColor: "text-emerald-700",
    },
    {
      title: "Today's Turf Rentals",
      value: stats?.todaysTurfRentals ?? 0,
      icon: Calendar,
      cardBg: "bg-orange-50/80",
      iconBg: "bg-orange-200",
      iconColor: "text-orange-700",
    },
    {
      title: "Monthly Revenue",
      value: `₹${stats?.monthlyRevenue ?? 0}`,
      icon: IndianRupee,
      cardBg: "bg-yellow-50/80",
      iconBg: "bg-yellow-200",
      iconColor: "text-yellow-700",
      subText: stats?.revenueBreakup
        ? `Coaching ₹${stats.revenueBreakup.enrollments} • Turf ₹${stats.revenueBreakup.turfRentals}`
        : null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <Card
          key={i}
          className={`${card.cardBg} border-none rounded-xl transition-all hover:shadow-lg`}
        >
          <CardContent className="p-6 flex items-center justify-between">
            {/* LEFT */}
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                {card.title}
              </p>

              <h2 className="text-3xl font-bold text-foreground mt-2">
                {loading ? "—" : card.value}
              </h2>

              {card.subText && (
                <p className="text-xs text-muted-foreground mt-1">
                  {card.subText}
                </p>
              )}
            </div>

            {/* RIGHT ICON */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}
            >
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
