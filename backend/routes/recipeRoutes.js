const express = require("express");

const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe
} = require("../controllers/recipeController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getRecipes);

router.get("/:id", getRecipeById);

router.post("/", protect, upload.single("image"), createRecipe);

router.put("/:id", protect, upload.single("image"), updateRecipe);

router.delete("/:id", protect, deleteRecipe);

module.exports = router;