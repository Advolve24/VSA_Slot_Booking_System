/**
 * Booking Controller
 * ------------------
 * This is a boilerplate controller to prevent
 * route import crashes and allow future extension.
 */

/* ======================================================
   CREATE BOOKING
   POST /api/bookings
====================================================== */
exports.createBooking = async (req, res) => {
  try {
    res.status(201).json({
      message: "Booking created successfully (boilerplate)",
      data: req.body,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET ALL BOOKINGS
   GET /api/bookings
====================================================== */
exports.getBookings = async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error("Get Bookings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET SINGLE BOOKING
   GET /api/bookings/:id
====================================================== */
exports.getBookingById = async (req, res) => {
  try {
    res.json({
      id: req.params.id,
      message: "Single booking (boilerplate)",
    });
  } catch (error) {
    console.error("Get Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   UPDATE BOOKING
   PATCH /api/bookings/:id
====================================================== */
exports.updateBooking = async (req, res) => {
  try {
    res.json({
      message: "Booking updated successfully (boilerplate)",
      id: req.params.id,
      updates: req.body,
    });
  } catch (error) {
    console.error("Update Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   DELETE BOOKING
   DELETE /api/bookings/:id
====================================================== */
exports.deleteBooking = async (req, res) => {
  try {
    res.json({
      message: "Booking deleted successfully (boilerplate)",
      id: req.params.id,
    });
  } catch (error) {
    console.error("Delete Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
