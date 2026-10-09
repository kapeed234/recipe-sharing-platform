const express = require("express");

const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  toggleSaveRecipe,
  getSavedRecipes
} = require("../controllers/recipeController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getRecipes);

// Saved recipes routes - defined before /:id so "saved" is not treated as an ID param
router.get("/saved", protect, getSavedRecipes);
router.post("/:id/save", protect, toggleSaveRecipe);

router.get("/:id", getRecipeById);

router.post("/", protect, upload.single("image"), createRecipe);

router.put("/:id", protect, upload.single("image"), updateRecipe);

router.delete("/:id", protect, deleteRecipe);

module.exports = router;