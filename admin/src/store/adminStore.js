import { create } from "zustand";
import api from "../lib/axios";

export const useAdminStore = create((set) => ({
  stats: null,
  activity: [],

  // ✅ ADMIN DASHBOARD
  fetchDashboard: async () => {
    try {
      const res = await api.get("/dashboard/admin");
      set({ stats: res.data });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  },

  // ✅ ADMIN ACTIVITY
  fetchActivity: async () => {
    try {
      const res = await api.get("/activity/admin");
      set({ activity: res.data });
    } catch (err) {
      console.error("Activity fetch error:", err);
    }
  },
}));
