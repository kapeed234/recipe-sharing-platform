const Recipe = require("../models/Recipe");
const User = require("../models/User");

const getCloudinaryUrl = (file) => {
  if (!file) return "";
  return file.path || file.secure_url || file.url || "";
};

// Create a recipe
const createRecipe = async (req, res) => {
  try {
    const {
      title,
      description,
      ingredients,
      instructions,
      category,
      difficulty,
      cookingTime
    } = req.body;

    if (!title || !ingredients || !instructions || !category || !cookingTime) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    let parsedIngredients = ingredients;
    if (typeof ingredients === "string") {
      try {
        parsedIngredients = JSON.parse(ingredients);
      } catch (error) {
        parsedIngredients = ingredients.split(",").map((item) => item.trim()).filter(Boolean);
      }
    }

    const recipe = await Recipe.create({
      title,
      description,
      ingredients: parsedIngredients,
      instructions,
      category,
      difficulty,
      cookingTime,
      image: getCloudinaryUrl(req.file),
      author: req.user.id
    });

    res.status(201).json({ message: "Recipe created successfully", recipe });
  } catch (error) {
    console.error("Create Recipe Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all recipes with search and filters
const getRecipes = async (req, res) => {
  try {
    const { search, category, difficulty, maxTime } = req.query;
    const filter = {};

    if (search) filter.title = { $regex: search, $options: "i" };
    if (category) filter.category = { $regex: `^${category}$`, $options: "i" };
    if (difficulty) filter.difficulty = { $regex: `^${difficulty}$`, $options: "i" };
    if (maxTime) filter.cookingTime = { $lte: Number(maxTime) };

    const recipes = await Recipe.find(filter)
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: recipes.length, recipes });
  } catch (error) {
    console.error("Get Recipes Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get one recipe
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("author", "name email");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a recipe
const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to update this recipe" });
    }

    const {
      title,
      description,
      ingredients,
      instructions,
      category,
      difficulty,
      cookingTime
    } = req.body;

    recipe.title = title ?? recipe.title;
    recipe.description = description ?? recipe.description;

    if (ingredients !== undefined) {
      let parsedIngredients = ingredients;
      if (typeof ingredients === "string") {
        try {
          parsedIngredients = JSON.parse(ingredients);
        } catch (error) {
          parsedIngredients = ingredients.split(",").map((item) => item.trim()).filter(Boolean);
        }
      }
      recipe.ingredients = parsedIngredients;
    }

    recipe.instructions = instructions ?? recipe.instructions;
    recipe.category = category ?? recipe.category;
    recipe.difficulty = difficulty ?? recipe.difficulty;
    recipe.cookingTime = cookingTime ?? recipe.cookingTime;

    if (req.file) {
      recipe.image = getCloudinaryUrl(req.file);
    }

    const updatedRecipe = await recipe.save();
    res.status(200).json({ message: "Recipe updated successfully", recipe: updatedRecipe });
  } catch (error) {
    console.error("Update Recipe Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a recipe
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to delete this recipe" });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    // Remove this recipe from any users who saved it
    await User.updateMany(
      { savedRecipes: req.params.id },
      { $pull: { savedRecipes: req.params.id } }
    );

    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Delete Recipe Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Toggle save/unsave recipe for the authenticated user
const toggleSaveRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.savedRecipes) {
      user.savedRecipes = [];
    }

    const isAlreadySaved = user.savedRecipes.some(
      (id) => id.toString() === recipeId
    );

    if (isAlreadySaved) {
      user.savedRecipes = user.savedRecipes.filter(
        (id) => id.toString() !== recipeId
      );
      await user.save();
      return res.status(200).json({
        message: "Recipe removed from your saved recipes",
        isSaved: false,
        savedRecipeIds: user.savedRecipes
      });
    } else {
      user.savedRecipes.push(recipeId);
      await user.save();
      return res.status(200).json({
        message: "Recipe saved to your favorites!",
        isSaved: true,
        savedRecipeIds: user.savedRecipes
      });
    }
  } catch (error) {
    console.error("Toggle Save Recipe Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all saved recipes for the authenticated user
const getSavedRecipes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "savedRecipes",
      populate: {
        path: "author",
        select: "name email"
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out null recipes (e.g. if any recipe was deleted)
    const recipes = (user.savedRecipes || []).filter((r) => r !== null);
    const savedRecipeIds = recipes.map((r) => r._id);

    res.status(200).json({
      count: recipes.length,
      recipes,
      savedRecipeIds
    });
  } catch (error) {
    console.error("Get Saved Recipes Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  toggleSaveRecipe,
  getSavedRecipes
};

