import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://recipe-sharing-backend-cltn.onrender.com";

function CreateRecipe({ onBack, onCreated }) {
  const [formData, setFormData] = useState({ title: "", description: "", ingredients: "", instructions: "", category: "Vegetarian", difficulty: "Easy", cookingTime: "" });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return setMessage("Please login first.");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "ingredients") {
        data.append("ingredients", JSON.stringify(value.split(",").map((item) => item.trim()).filter(Boolean)));
      } else data.append(key, value);
    });
    if (image) data.append("image", image);

    try {
      const response = await fetch(`${API_URL}/api/recipes`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: data });
      const result = await response.json();
      if (response.ok) {
        setMessage("Recipe created successfully!");
        if (onCreated) onCreated();
      } else setMessage(result.message || "Failed to create recipe.");
    } catch (error) {
      console.error("Create recipe error:", error);
      setMessage("Unable to connect to server.");
    }
  };

  return (
    <div className="create-recipe-container"><div className="create-recipe-box">
      <h1>🍴 Create Recipe</h1>
      <form onSubmit={handleSubmit}>
        <label>Recipe Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter recipe title" required />
        <label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} placeholder="Enter recipe description" required />
        <label>Ingredients</label><textarea name="ingredients" value={formData.ingredients} onChange={handleChange} placeholder="Enter ingredients separated by commas" required />
        <label>Instructions</label><textarea name="instructions" value={formData.instructions} onChange={handleChange} placeholder="Enter cooking instructions" required />
        <label>Category</label><select name="category" value={formData.category} onChange={handleChange} required><option>Vegetarian</option><option>Non-Vegetarian</option><option>Dessert</option><option>Snacks</option><option>Beverages</option></select>
        <label>Difficulty</label><select name="difficulty" value={formData.difficulty} onChange={handleChange} required><option>Easy</option><option>Medium</option><option>Hard</option></select>
        <label>Cooking Time (minutes)</label><input type="number" name="cookingTime" value={formData.cookingTime} onChange={handleChange} min="1" placeholder="Example: 30" required />
        <label>Recipe Image</label><input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        {message && <p className="create-message">{message}</p>}
        <div className="create-recipe-buttons"><button type="button" onClick={onBack}>← Back</button><button type="submit">➕ Create Recipe</button></div>
      </form>
    </div></div>
  );
}

export default CreateRecipe;
