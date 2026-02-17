import { create } from "zustand";
import api from "../lib/axios";

export const useAdminStore = create((set) => ({
  stats: null,
  loading: false,

  fetchDashboard: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/dashboard/admin");
      set({ stats: res.data });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      set({ loading: false });
    }
  },
}));
