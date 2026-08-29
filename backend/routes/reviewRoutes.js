const express = require("express");

const {
  createReview,
  getReviews,
  updateReview,
  deleteReview
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create review
router.post("/", protect, createReview);

// Get reviews for a recipe
router.get("/:recipeId", getReviews);

// Update review
router.put("/:id", protect, updateReview);

// Delete review
router.delete("/:id", protect, deleteReview);

module.exports = router;