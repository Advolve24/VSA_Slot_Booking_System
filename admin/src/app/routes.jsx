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

/* ================= REPORTS ================= */
import Reports from "./pages/reports/Reports";

/* ================= INVOICE VIEW ================= */
import EnrollmentInvoiceView from "./pages/invoice/EnrollmentInvoiceView";
import TurfInvoiceView from "./pages/invoice/TurfInvoiceview";
import Settings from "./pages/settings/Settings";

export default function RoutesList() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      {/* ================= AUTH ================= */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ================= ADMIN PROTECTED ================= */}
      <Route
        path="/admin"
        element={
          isAuthenticated ? (
            <AdminLayout />
          ) : (
            <Navigate to="/admin/login" />
          )
        }
      >
        {/* DASHBOARD */}
        <Route index element={<AdminDashboard />} />

        {/* ================= ENROLLMENTS ================= */}
        <Route path="enrollments" element={<EnrollmentsLayout />}>
          <Route index element={<CoachingEnrollments />} />
          <Route path="coaching" element={<CoachingEnrollments />} />
        </Route>
         <Route
            path="invoice/:id"
            element={<EnrollmentInvoiceView />}
          />

        {/* ================= SPORTS ================= */}
        <Route path="sports" element={<SportsPage />} />

        {/* ================= COACHING BATCHES ================= */}
        <Route path="batches" element={<CoachingBatches />} />

        {/* ================= FACILITIES ================= */}
        <Route path="facilities" element={<FacilitiesPage />} />

        {/* ================= TURF RENTALS ================= */}
        <Route path="turf-rentals" element={<TurfRentals />} />
        <Route
          path="turf-rentals/invoice/:id"
          element={<TurfInvoiceView />}
        />

        {/* ================= REPORTS ================= */}
        <Route path="reports" element={<Reports />} />

        {/* SETTINGS */}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/admin/login" />} />
    </Routes>
  );
}
