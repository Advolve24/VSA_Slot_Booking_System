import { create } from "zustand";

export const useEnrollmentStore = create((set) => ({
  selectedSport: null,
  selectedBatch: null,
  formData: {},
  
  setSport: (v) => set({ selectedSport: v }),
  setBatch: (v) => set({ selectedBatch: v }),
  setFormData: (v) => set({ formData: v }),

  reset: () => set({
    selectedSport: null,
    selectedBatch: null,
    formData: {}
  }),
}));
