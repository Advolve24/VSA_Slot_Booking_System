const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const studentRoutes = require("./routes/student.routes");
const sportRoutes = require("./routes/sport.routes");
const facilityRoutes = require("./routes/facility.routes");
const timeSlotRoutes = require("./routes/timeslot.routes");
const batchRoutes = require("./routes/batch.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");
const bookingRoutes = require("./routes/booking.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const paymentRoutes = require("./routes/payment.routes");
const notificationRoutes = require("./routes/notification.routes");
const announcementRoutes = require("./routes/announcement.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const activityRoutes = require("./routes/activity.routes");
const turfRentalRoutes = require("./routes/turfRental.routes");

const app = express();

// -------------------------------------------
// GLOBAL MIDDLEWARES
// -------------------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174", // admin local (if used)
      "https://vsa-slot-booking-system.vercel.app/",
      "https://vsa-slot-admin-system.vercel.app/",
    ],
    credentials: true,
  })
);


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// -------------------------------------------
// STATIC FILES
// -------------------------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------------------------------
// HEALTH CHECK
// -------------------------------------------
app.get("/", (_, res) => {
  res.send("VSA Backend API Running 🚀");
});

app.get("/api/health", (_, res) => {
  res.json({ status: "ok", time: new Date() });
});

// -------------------------------------------
// API ROUTES
// -------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/sports", sportRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/timeslots", timeSlotRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/turf-rentals", turfRentalRoutes);
// -------------------------------------------
// 404 HANDLER
// -------------------------------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// -------------------------------------------
// ERROR HANDLER
// -------------------------------------------
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
