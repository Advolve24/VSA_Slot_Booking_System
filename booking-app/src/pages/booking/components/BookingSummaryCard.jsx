// src/pages/booking/components/BookingSummaryCard.jsx
import { Card } from "@/components/ui/card";

export function BookingSummaryCard({ sport, facility, date, slot, price }) {
  return (
    <Card className="p-5 rounded-xl shadow-sm border-green-200 bg-green-50">
      <h3 className="font-semibold text-lg text-green-800 mb-3">Booking Summary</h3>

      <div className="space-y-1 text-sm text-gray-700">
        <p><strong>Sport:</strong> {sport?.name}</p>
        <p><strong>Facility:</strong> {facility?.name}</p>
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Time:</strong> {slot?.startTime} – {slot?.endTime}</p>

        <p className="pt-3 border-t mt-3 text-lg font-semibold text-orange-600">
          Total: ₹{price || slot?.price}
        </p>
      </div>
    </Card>
  );
}
