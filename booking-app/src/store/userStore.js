import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: null,
  token: null,

  /* ================= LOGIN / AUTH ================= */
  setAuth: ({ user, token }) =>
    set(() => {
      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      return { user, token };
    }),

  /* ================= UPDATE USER ONLY (PROFILE EDIT) ================= */
  setUser: (user) =>
    set((state) => {
      if (user) localStorage.setItem("user", JSON.stringify(user));
      return { ...state, user };
    }),

  /* ================= HYDRATE ON APP LOAD ================= */
  hydrate: () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
      });
    }
  },

  /* ================= LOGOUT ================= */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },
}));
