import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://recipe-sharing-backend-cltn.onrender.com";

function EditRecipe({ recipeId, onBack, onUpdated }) {
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
  const [currentImage, setCurrentImage] = useState("");
  const [message, setMessage] = useState("Loading recipe...");

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`${API_URL}/api/recipes/${recipeId}`);
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Recipe not found.");
          return;
        }

        setFormData({
          title: data.title || "",
          description: data.description || "",
          ingredients: Array.isArray(data.ingredients)
            ? data.ingredients.join(", ")
            : data.ingredients || "",
          instructions: data.instructions || "",
          category: data.category || "Vegetarian",
          difficulty: data.difficulty || "Easy",
          cookingTime: data.cookingTime || ""
        });

        setCurrentImage(data.image || "");
        setMessage("");
      } catch (error) {
        console.error("Fetch recipe error:", error);
        setMessage("Unable to load recipe.");
      }
    };

    if (recipeId) fetchRecipe();
  }, [recipeId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please login first.");
      return;
    }

    const ingredientsArray = formData.ingredients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("ingredients", JSON.stringify(ingredientsArray));
    data.append("instructions", formData.instructions);
    data.append("category", formData.category);
    data.append("difficulty", formData.difficulty);
    data.append("cookingTime", formData.cookingTime);

    if (image) data.append("image", image);

    try {
      setMessage("Updating recipe...");

      const response = await fetch(`${API_URL}/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Failed to update recipe.");
        return;
      }

      setMessage("Recipe updated successfully!");
      if (onUpdated) onUpdated(result.recipe);
    } catch (error) {
      console.error("Update recipe error:", error);
      setMessage("Unable to connect to server.");
    }
  };

  return (
    <div className="edit-recipe-container">
      <div className="edit-recipe-box">
        <button onClick={onBack}>← Back</button>
        <h1>Edit Recipe</h1>
        {message && <p>{message}</p>}

        {currentImage && (
          <div>
            <p>Current Image:</p>
            <img src={currentImage.startsWith("http") ? currentImage : `${API_URL}${currentImage}`} alt="Current recipe" width="300" />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div><label>Recipe Title</label><br /><input type="text" name="title" value={formData.title} onChange={handleChange} required /></div><br />
          <div><label>Description</label><br /><textarea name="description" value={formData.description} onChange={handleChange} /></div><br />
          <div><label>Ingredients</label><br /><input type="text" name="ingredients" value={formData.ingredients} onChange={handleChange} placeholder="Rice, Chicken, Onion, Tomato" required /><p>Separate each ingredient with a comma.</p></div><br />
          <div><label>Instructions</label><br /><textarea name="instructions" value={formData.instructions} onChange={handleChange} required /></div><br />
          <div><label>Category</label><br /><select name="category" value={formData.category} onChange={handleChange}><option value="Vegetarian">Vegetarian</option><option value="Non-Vegetarian">Non-Vegetarian</option><option value="Dessert">Dessert</option><option value="Snacks">Snacks</option><option value="Beverages">Beverages</option></select></div><br />
          <div><label>Difficulty</label><br /><select name="difficulty" value={formData.difficulty} onChange={handleChange}><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></select></div><br />
          <div><label>Cooking Time (minutes)</label><br /><input type="number" name="cookingTime" value={formData.cookingTime} onChange={handleChange} required /></div><br />
          <div><label>Replace Recipe Image</label><br /><input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => setImage(e.target.files?.[0] || null)} />{image && <p>Selected: {image.name}</p>}</div><br />
          <button type="submit">Update Recipe</button>
        </form>
      </div>
    </div>
  );
}

export default EditRecipe;
