require("dotenv").config();
const mongoose = require("mongoose");

/* ================================
   CONNECT DATABASE
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // Optional fix script
    if (process.env.RUN_FIX_BATCH_COUNT === "true") {
      console.log("Running batch enrollment fix...");
      const fixBatchCounts = require("./scripts/fixBatchEnrollmentCount");
      await fixBatchCounts();
    }

    const app = require("./app");

    const PORT = process.env.PORT || 5000;

    // 🔥 IMPORTANT FOR RENDER
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB error:", err);
    process.exit(1); // stop process so Render knows it failed
  });
