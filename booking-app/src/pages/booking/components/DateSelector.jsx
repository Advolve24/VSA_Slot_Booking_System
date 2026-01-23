// src/pages/booking/components/DateSelector.jsx
import { useBookingStore } from "@/store/bookingStore";
import { Calendar } from "@/components/ui/calendar";

export default function DateSelector() {
  const { sport, facility, date, setDate } = useBookingStore();

  if (!sport || !facility) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-green-800">Choose a Date</h2>

      <div className="border rounded-xl p-4 bg-white">
        <Calendar
          mode="single"
          selected={date ? new Date(date) : undefined}
          onSelect={(newDate) => setDate(newDate.toISOString().split("T")[0])}
          disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
        />
      </div>
    </div>
  );
}
