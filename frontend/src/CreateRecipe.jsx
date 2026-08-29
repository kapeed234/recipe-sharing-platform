import { useState } from "react";

function CreateRecipe({ onBack, onCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: "",
    instructions: "",
    category: "Vegetarian",
    difficulty: "Easy",
    cookingTime: ""
  });

  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Submit recipe
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    const data = new FormData();

    data.append("title", formData.title);
    data.append("description", formData.description);

    const ingredientsArray = formData.ingredients
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    data.append(
      "ingredients",
      JSON.stringify(ingredientsArray)
    );

    data.append("instructions", formData.instructions);
    data.append("category", formData.category);
    data.append("difficulty", formData.difficulty);
    data.append("cookingTime", formData.cookingTime);

    if (image) {
      data.append("image", image);
    }

    try {
      const response = await fetch(
        "https://recipe-sharing-platform-d6x4.onrender.com/api/recipes",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: data
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMessage("Recipe created successfully!");

        setFormData({
          title: "",
          description: "",
          ingredients: "",
          instructions: "",
          category: "Vegetarian",
          difficulty: "Easy",
          cookingTime: ""
        });

        setImage(null);

        if (onCreated) {
          onCreated();
        }
      } else {
        setMessage(
          result.message || "Failed to create recipe."
        );
      }
    } catch (error) {
      console.error("Create recipe error:", error);
      setMessage("Unable to connect to server.");
    }
  };

  return (
    <div className="create-recipe-container">

      <div className="create-recipe-box">

        <h1>🍴 Create Recipe</h1>

        <form onSubmit={handleSubmit}>

          {/* Recipe Title */}
          <label>Recipe Title</label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter recipe title"
            required
          />


          {/* Description */}
          <label>Description</label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter recipe description"
            required
          />


          {/* Ingredients */}
          <label>Ingredients</label>

          <textarea
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            placeholder="Enter ingredients separated by commas"
            required
          />


          {/* Instructions */}
          <label>Instructions</label>

          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Enter cooking instructions"
            required
          />


          {/* Category */}
          <label>Category</label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="Vegetarian">
              Vegetarian
            </option>

            <option value="Non-Vegetarian">
              Non-Vegetarian
            </option>

            <option value="Dessert">
              Dessert
            </option>

            <option value="Snacks">
              Snacks
            </option>

            <option value="Beverages">
              Beverages
            </option>
          </select>


          {/* Difficulty */}
          <label>Difficulty</label>

          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            required
          >
            <option value="Easy">
              Easy
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Hard">
              Hard
            </option>
          </select>


          {/* Cooking Time */}
          <label>Cooking Time (minutes)</label>

          <input
            type="number"
            name="cookingTime"
            value={formData.cookingTime}
            onChange={handleChange}
            placeholder="Example: 30"
            min="1"
            required
          />


          {/* Image */}
          <label>Recipe Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files[0])
            }
          />


          {/* Message */}
          {message && (
            <p className="create-message">
              {message}
            </p>
          )}


          {/* Buttons */}
          <div className="create-recipe-buttons">

            <button
              type="button"
              onClick={onBack}
            >
              ← Back
            </button>

            <button type="submit">
              ➕ Create Recipe
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateRecipe;