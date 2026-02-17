import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "@/app/layout/MainLayout";

import Home from "@/pages/Home";
import EnrollCoaching from "@/pages/enrollment/EnrollCoaching";
import TurfBooking from "@/pages/booking/TurfBooking";
import TurfConfirm from "@/pages/booking/TurfConfirm";

import MyAccount from "@/pages/MyAccount";
import MyEnrollments from "@/pages/MyEnrollments";
import MyTurfBookings from "@/pages/MyTurfBookings";

import ProtectedRoute from "@/app/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Layout Wrapper */}
        <Route element={<MainLayout />}>

          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/enroll" element={<EnrollCoaching />} />
          <Route path="/book-turf" element={<TurfBooking />} />
          <Route path="/book-turf/confirm" element={<TurfConfirm />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<MyAccount />} />
            <Route path="/my-enrollments" element={<MyEnrollments />} />
            <Route path="/my-turf-bookings" element={<MyTurfBookings />} />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="py-20 text-center text-gray-500">
                Page Not Found
              </div>
            }
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
