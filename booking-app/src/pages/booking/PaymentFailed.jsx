// src/pages/booking/PaymentFailed.jsx
import MainLayout from "@/app/layout/MainLayout";

export default function PaymentFailed() {
  return (
    <MainLayout>
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold text-red-600">Payment Failed ❌</h1>
        <p className="text-gray-600 mt-2">
          Something went wrong. Please try again.
        </p>
      </div>
    </MainLayout>
  );
}
