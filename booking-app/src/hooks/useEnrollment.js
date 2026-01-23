import api from "../lib/axios";
import { useEnrollmentStore } from "../store/enrollmentStore";

export function useEnrollment() {
  const store = useEnrollmentStore();

  const fetchBatches = async (sportId) => {
    const res = await api.get(`/api/batch/by-sport/${sportId}`);
    return res.data;
  };

  const createEnrollment = async (payload) => {
    const res = await api.post("/api/enrollment/create", payload);
    return res.data;
  };

  return { ...store, fetchBatches, createEnrollment };
}
