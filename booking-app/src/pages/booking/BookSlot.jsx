// src/pages/booking/BookSlot.jsx
import { useBookingStore } from "@/store/bookingStore";
import SportSelector from "./components/SportSelector";
import FacilitySelector from "./components/FacilitySelector";
import DateSelector from "./components/DateSelector";
import SlotGrid from "./components/SlotGrid";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function BookSlot() {
  const navigate = useNavigate();
  const { selectedSlot, sport, facility, date } = useBookingStore();

  const canContinue = sport && facility && date && selectedSlot;

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-semibold text-green-800">
          Book Your Slot
        </h1>
        <p className="text-gray-600 text-sm">
          Select sport, facility, date, and time.
        </p>
      </div>

      {/* Step 1: Sport */}
      <SportSelector />

      {/* Step 2: Facility */}
      <FacilitySelector />

      {/* Step 3: Date */}
      <DateSelector />

      {/* Step 4: Slot Grid */}
      <SlotGrid />

      {/* Continue Button */}
      <div className="pt-6 flex justify-center">
        <Button
          disabled={!canContinue}
          className="w-full max-w-md bg-orange-500 hover:bg-orange-600 text-white rounded-full py-6 text-base"
          onClick={() => navigate("/book/confirm")}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
