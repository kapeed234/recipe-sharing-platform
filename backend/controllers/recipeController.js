const Recipe = require("../models/Recipe");

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
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    let parsedIngredients = ingredients;

    if (typeof ingredients === "string") {
      try {
        parsedIngredients = JSON.parse(ingredients);
      } catch (error) {
        parsedIngredients = ingredients
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
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
      image: req.file ? "/uploads/" + req.file.filename : "",
      author: req.user.id
    });

    res.status(201).json({
      message: "Recipe created successfully",
      recipe
    });
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

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (category) {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    if (difficulty) {
      filter.difficulty = { $regex: `^${difficulty}$`, $options: "i" };
    }

    if (maxTime) {
      filter.cookingTime = { $lte: Number(maxTime) };
    }

    const recipes = await Recipe.find(filter)
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error("Get Recipes Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get one recipe
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("author", "name email");

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a recipe
const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.author.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to update this recipe"
      });
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
          parsedIngredients = ingredients
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      }

      recipe.ingredients = parsedIngredients;
    }

    recipe.instructions = instructions ?? recipe.instructions;
    recipe.category = category ?? recipe.category;
    recipe.difficulty = difficulty ?? recipe.difficulty;
    recipe.cookingTime = cookingTime ?? recipe.cookingTime;

    // Replace the image only when a new image was uploaded.
    if (req.file) {
      recipe.image = "/uploads/" + req.file.filename;
    }

    const updatedRecipe = await recipe.save();

    res.status(200).json({
      message: "Recipe updated successfully",
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error("Update Recipe Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a recipe
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.author.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this recipe"
      });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Recipe deleted successfully"
    });
  } catch (error) {
    console.error("Delete Recipe Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe
};
