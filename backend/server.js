const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ================= DATABASE CONNECTION MIDDLEWARE =================
// Ensures MongoDB connection is ready in serverless environments
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DB Middleware Error:", error.message);
    res.status(500).json({
      message: "Database connection failed",
      error: error.message
    });
  }
});

// ================= AUTHENTICATION ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));

// ================= TEST ROUTE =================
app.get("/test", (req, res) => {
  res.json({ message: "Test route is working" });
});

// ================= RECIPE ROUTES =================
app.use("/api/recipes", require("./routes/recipeRoutes"));

// ================= REVIEW ROUTES =================
app.use("/api/reviews", require("./routes/reviewRoutes"));

// ================= HOME ROUTE =================
app.get("/", (req, res) => {
  res.json({ message: "Recipe Sharing API is running" });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  if (err.name === "MulterError" || err.message?.includes("Only JPG")) {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: err.message || "Internal server error" });
});

// ================= START SERVER (Local / Non-Vercel) =================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  connectDB().catch((err) => {
    console.error("Initial DB connection failed:", err.message);
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
