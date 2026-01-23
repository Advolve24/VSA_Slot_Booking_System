// src/pages/booking/ConfirmBooking.jsx
import MainLayout from "@/app/layout/MainLayout";
import { BookingSummaryCard } from "./components/BookingSummaryCard";
import ParentPlayerForm from "./components/ParentPlayerForm";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/store/bookingStore";
import { useNavigate } from "react-router-dom";

export default function ConfirmBooking() {
  const navigate = useNavigate();
  const { sport, facility, date, selectedSlot, price } = useBookingStore();

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-green-800">
          Confirm Your Booking
        </h1>

        {/* Summary + Payment Card */}
        <BookingSummaryCard
          sport={sport}
          facility={facility}
          date={date}
          slot={selectedSlot}
          price={price}
        />

        {/* Parent & Player Form */}
        <ParentPlayerForm />

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            className="border-green-700 text-green-700"
            onClick={() => navigate("/book-slot")}
          >
            Back to Slots
          </Button>

          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => navigate("/payment-success")}
          >
            Proceed to Payment
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
