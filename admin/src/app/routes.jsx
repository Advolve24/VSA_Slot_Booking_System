import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./providers/AuthProvider";

import AdminLayout from "./layout/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

/* ================= ENROLLMENTS ================= */
import EnrollmentsLayout from "./pages/enrollments/EnrollmentsLayout";
import CoachingEnrollments from "./pages/enrollments/CoachingEnrollments";

/* ================= SPORTS ================= */
import SportsPage from "./pages/sports/SportsPage";

/* ================= BATCHES ================= */
import CoachingBatches from "./pages/batches/CoachingBatches";

/* ================= FACILITIES ================= */
import FacilitiesPage from "./pages/facilities/FacilitiesPage";

/* ================= TURF RENTALS ================= */
import TurfRentals from "./pages/turf-rental/TurfRentals";

export default function RoutesList() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // or a Loader component

  return (
    <Routes>
      {/* ================= AUTH ================= */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin"
        element={
          isAuthenticated ? <AdminLayout /> : <Navigate to="/admin/login" />
        }
      >
        {/* DASHBOARD */}
        <Route index element={<AdminDashboard />} />

        {/* ENROLLMENTS */}
        <Route path="enrollments" element={<EnrollmentsLayout />}>
          <Route index element={<CoachingEnrollments />} />
          <Route path="coaching" element={<CoachingEnrollments />} />
        </Route>

        {/* SPORTS */}
        <Route path="sports" element={<SportsPage />} />

        {/* COACHING BATCHES */}
        <Route path="batches" element={<CoachingBatches />} />

        {/* FACILITIES (TAB VIEW: Facilities + Blocked Slots) */}
        <Route path="facilities" element={<FacilitiesPage />} />

        {/* BOOKINGS (PLACEHOLDER) */}
        <Route path="bookings" element={<div>Bookings</div>} />

        {/* TURF RENTALS */}
        <Route path="turf-rentals" element={<TurfRentals />} />

        {/* REPORTS */}
        <Route path="reports" element={<div>Reports</div>} />

        {/* SETTINGS */}
        <Route path="settings" element={<div>Settings</div>} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/admin/login" />} />
    </Routes>
  );
}
