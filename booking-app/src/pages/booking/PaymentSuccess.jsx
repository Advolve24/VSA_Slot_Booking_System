// src/pages/booking/PaymentSuccess.jsx
import MainLayout from "@/app/layout/MainLayout";

export default function PaymentSuccess() {
  return (
    <MainLayout>
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold text-green-700">Payment Successful 🎉</h1>
        <p className="text-gray-600 mt-2">Your slot has been successfully booked.</p>
      </div>
    </MainLayout>
  );
}
