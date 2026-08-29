const Review = require("../models/Review");

// ================= CREATE REVIEW =================
const createReview = async (req, res) => {
  try {
    const { recipeId, rating, comment } = req.body;

    if (!recipeId || !rating || !comment) {
      return res.status(400).json({
        message: "Recipe, rating and comment are required"
      });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    const review = await Review.create({
      recipe: recipeId,
      user: req.user.id,
      rating: Number(rating),
      comment: comment.trim()
    });

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name email");

    res.status(201).json({
      message: "Review added successfully",
      review: populatedReview
    });

  } catch (error) {
    console.error("Create Review Error:", error);

    res.status(500).json({
      message: error.message
    });
  }
};


// ================= GET REVIEWS =================
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      recipe: req.params.recipeId
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error("Get Reviews Error:", error);

    res.status(500).json({
      message: error.message
    });
  }
};


// ================= UPDATE REVIEW =================
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    // Only review owner can edit
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to update this review"
      });
    }

    if (!rating || !comment) {
      return res.status(400).json({
        message: "Rating and comment are required"
      });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    review.rating = Number(rating);
    review.comment = comment.trim();

    const updatedReview = await review.save();

    const populatedReview = await Review.findById(updatedReview._id)
      .populate("user", "name email");

    res.status(200).json({
      message: "Review updated successfully",
      review: populatedReview
    });

  } catch (error) {
    console.error("Update Review Error:", error);

    res.status(500).json({
      message: error.message
    });
  }
};


// ================= DELETE REVIEW =================
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    // Only review owner can delete
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this review"
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error("Delete Review Error:", error);

    res.status(500).json({
      message: error.message
    });
  }
};


module.exports = {
  createReview,
  getReviews,
  updateReview,
  deleteReview
};