const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ================= AUTHENTICATION ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));

// ================= TEST ROUTE =================
app.get("/test", (req, res) => {
  res.json({
    message: "Test route is working"
  });
});

// ================= RECIPE ROUTES =================
app.use("/api/recipes", require("./routes/recipeRoutes"));

// ================= REVIEW ROUTES =================
app.use("/api/reviews", require("./routes/reviewRoutes"));

// ================= HOME ROUTE =================
app.get("/", (req, res) => {
  res.json({
    message: "Recipe Sharing API is running"
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});