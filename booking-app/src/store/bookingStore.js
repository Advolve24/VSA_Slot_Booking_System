import { create } from "zustand";

export const useBookingStore = create((set) => ({
  sport: null,
  facility: null,
  date: null,
  slot: null,
  bookingData: {},
  
  setSport: (v) => set({ sport: v }),
  setFacility: (v) => set({ facility: v }),
  setDate: (v) => set({ date: v }),
  setSlot: (v) => set({ slot: v }),
  setBookingData: (v) => set({ bookingData: v }),

  reset: () => set({
    sport: null,
    facility: null,
    date: null,
    slot: null,
    bookingData: {}
  }),
}));
