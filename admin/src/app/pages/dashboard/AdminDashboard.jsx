import { useEffect } from "react";
import { useAdminStore } from "../../../store/adminStore";

import StatsCards from "./StatsCards";
import SecondaryStats from "./SecondaryStats";
import QuickActions from "./QuickActions";
import Charts from "./Charts";
import RevenueOverview from "./RevenueOverview";
import UpcomingSlots from "./UpcomingSlots";
import FacilityUtilization from "./FacilityUtilization";

export default function AdminDashboard() {
  const { stats, fetchDashboard, loading } = useAdminStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-green-800">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Academy overview
        </p>
      </div>

      {/* PRIMARY STATS */}
      <StatsCards stats={stats} loading={loading} />

      {/* SECONDARY STATS */}
      <SecondaryStats stats={stats} loading={loading} />

      {/* QUICK ACTIONS */}
      <QuickActions />

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Charts stats={stats} />
        <RevenueOverview data={stats?.revenueSeries || []} />
      </div>

      {/* UPCOMING SLOTS + UTILIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingSlots slots={stats?.upcomingSlots || []} />
        </div>

        <FacilityUtilization
          facilities={stats?.facilityUtilization || []}
          average={stats?.turfUtilization || 0}
        />
      </div>
    </div>
  );
}
