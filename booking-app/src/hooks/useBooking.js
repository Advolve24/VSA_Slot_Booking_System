import api from "../lib/axios";
import { useBookingStore } from "../store/bookingStore";

export function useBooking() {
  const store = useBookingStore();

  const fetchSlots = async (sport, facility, date) => {
    const res = await api.get(`/api/timeslot/available`, {
      params: { sport, facility, date }
    });
    return res.data;
  };

  const createBooking = async (payload) => {
    const res = await api.post("/api/booking/create", payload);
    return res.data;
  };

  return { ...store, fetchSlots, createBooking };
}
