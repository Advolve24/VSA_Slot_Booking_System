require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    if (process.env.RUN_FIX_BATCH_COUNT === "true") {
      console.log("Running batch enrollment fix...");
      const fixBatchCounts = require("./scripts/fixBatchEnrollmentCount");
      await fixBatchCounts();
    }

    const app = require("./app"); // or express setup
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("DB error:", err));
