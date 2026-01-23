import { useEffect } from "react";
import { useAdminStore } from "../../../store/adminStore";
import { useAuth } from "../../providers/AuthProvider";

import StatsCards from "./StatsCards";
import SecondaryStats from "./SecondaryStats";
import Charts from "./Charts";
import RecentActivity from "./RecentActivity";

export default function AdminDashboard() {
  const { stats, activity, fetchDashboard, fetchActivity, loading } =
    useAdminStore();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchDashboard(token);
      fetchActivity(token);
    }
  }, [token]);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-green-700">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back! Here's an overview of your academy.
        </p>
      </div>

      {/* PRIMARY STATS */}
      <StatsCards stats={stats} loading={loading} />

      {/* SECONDARY STATS */}
      <SecondaryStats stats={stats} loading={loading} />

      {/* ACTIVITY + CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Charts />
        <RecentActivity activity={activity} />
      </div>
    </div>
  );
}
