// src/pages/booking/components/SlotGrid.jsx
import { useBookingStore } from "@/store/bookingStore";
import useFetch from "@/hooks/useFetch";
import { Button } from "@/components/ui/button";

export default function SlotGrid() {
  const { facility, date, selectedSlot, setSlot } = useBookingStore();

  if (!facility || !date) return null;

  const { data, loading } = useFetch(
    `/api/timeslots?facility=${facility._id}&date=${date}`
  );

  if (loading) return <p>Loading slots...</p>;

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-green-800">Available Time Slots</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data?.map((slot) => (
          <Button
            key={slot._id}
            disabled={slot.isBooked}
            onClick={() => setSlot(slot)}
            className={`
              w-full py-3 rounded-xl 
              ${slot.isBooked ? "bg-gray-200 text-gray-500 cursor-not-allowed" : ""}
              ${selectedSlot?._id === slot._id ? "bg-green-600 text-white" : "bg-white border text-black"}
            `}
            variant={selectedSlot?._id === slot._id ? "default" : "outline"}
          >
            {slot.startTime} - {slot.endTime}
          </Button>
        ))}
      </div>
    </div>
  );
}
