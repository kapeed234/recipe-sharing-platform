import { useEffect, useState } from "react";
import Register from "./Register";
import Login from "./Login";
import CreateRecipe from "./CreateRecipe";
import EditRecipe from "./EditRecipe";

const API_URL = "https://recipe-sharing-backend-cltn.onrender.com";

function App() {
  const [page, setPage] = useState("login");
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [maxTime, setMaxTime] = useState("");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const fetchRecipes = async () => {
    try {
      setMessage("Loading recipes...");
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (category) params.append("category", category);
      if (difficulty) params.append("difficulty", difficulty);
      if (maxTime) params.append("maxTime", maxTime);
      const url = `${API_URL}/api/recipes${params.toString() ? `?${params}` : ""}`;
      console.log("Fetching recipes:", url);
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load recipes");
      setRecipes(data.recipes || []);
      setMessage("");
    } catch (error) {
      console.error("Fetch recipes error:", error);
      setMessage("Could not load recipes.");
    }
  };

  useEffect(() => {
    if (page === "recipes") fetchRecipes();
  }, [page]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setRecipes([]);
    setSelectedRecipe(null);
    setPage("login");
  };

  const openRecipe = async (recipe) => {
    setSelectedRecipe(recipe);
    setPage("details");
    setReviews([]);
    setReviewMessage("Loading reviews...");
    try {
      const response = await fetch(`${API_URL}/api/reviews/${recipe._id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load reviews");
      setReviews(data.reviews || []);
      setReviewMessage("");
    } catch (error) {
      console.error("Get reviews error:", error);
      setReviewMessage("Could not load reviews.");
    }
  };

  const deleteRecipe = async () => {
    const token = localStorage.getItem("token");
    if (!token || !selectedRecipe) return alert("Please login first.");
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    try {
      const response = await fetch(`${API_URL}/api/recipes/${selectedRecipe._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) return alert(data.message || "Failed to delete recipe.");
      alert("Recipe deleted successfully!");
      setSelectedRecipe(null);
      setPage("recipes");
      fetchRecipes();
    } catch (error) {
      console.error("Delete recipe error:", error);
      alert("Unable to connect to server.");
    }
  };

  const imageUrl = (image) => {
    if (!image) return "";
    return image.startsWith("http") ? image : `${API_URL}${image}`;
  };

  return (
    <div>
      {page === "login" && <Login onLogin={() => setPage("recipes")} onRegister={() => setPage("register")} />}
      {page === "register" && <Register onRegistered={() => setPage("login")} onBack={() => setPage("login")} />}

      {page === "recipes" && (
        <div className="recipe-container">
          <div className="recipe-header">
            <h1>🍴 Recipe Sharing Platform</h1>
            <div><button onClick={() => setPage("create")}>➕ Create Recipe</button><button onClick={handleLogout}>🚪 Logout</button></div>
          </div>

          <div className="filter-box">
            <h3>🔎 Search & Filter Recipes</h3>
            <div className="filter-controls">
              <input type="text" placeholder="Search recipe..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All Categories</option><option value="Vegetarian">Vegetarian</option><option value="Non-Vegetarian">Non-Vegetarian</option><option value="Dessert">Dessert</option><option value="Snacks">Snacks</option><option value="Beverages">Beverages</option></select>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="">All Difficulties</option><option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option></select>
              <input type="number" placeholder="Max cooking time" value={maxTime} onChange={(e) => setMaxTime(e.target.value)} />
              <button onClick={fetchRecipes}>🔍 Search</button>
              <button onClick={() => { setSearch(""); setCategory(""); setDifficulty(""); setMaxTime(""); setTimeout(fetchRecipes, 0); }}>Clear Filters</button>
            </div>
          </div>

          <hr />
          <p>{message}</p>
          {recipes.length === 0 && !message && <p>No recipes found.</p>}
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <div className="recipe-card" key={recipe._id}>
                {recipe.image && <img className="recipe-card-image" src={imageUrl(recipe.image)} alt={recipe.title} />}
                <div className="recipe-card-content">
                  <h2>{recipe.title}</h2>
                  <p className="recipe-description">{recipe.description}</p>
                  <div className="recipe-info">
                    <p><strong>Category</strong><span>{recipe.category}</span></p>
                    <p><strong>Difficulty</strong><span>{recipe.difficulty}</span></p>
                    <p><strong>Cooking Time</strong><span>⏱️ {recipe.cookingTime} minutes</span></p>
                  </div>
                  <button className="view-recipe-button" onClick={() => openRecipe(recipe)}>👁️ View Recipe</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "create" && <CreateRecipe onBack={() => setPage("recipes")} onCreated={() => { setPage("recipes"); fetchRecipes(); }} />}

      {page === "details" && selectedRecipe && (
        <div className="recipe-details-page">
          <button onClick={() => setPage("recipes")}>← Back</button>
          <h1>{selectedRecipe.title}</h1>
          {selectedRecipe.image && <img src={imageUrl(selectedRecipe.image)} alt={selectedRecipe.title} width="400" />}
          <h3>Description</h3><p>{selectedRecipe.description}</p>
          <h3>Ingredients</h3>
          {Array.isArray(selectedRecipe.ingredients) ? <ul>{selectedRecipe.ingredients.map((ingredient, index) => <li key={index}>{ingredient}</li>)}</ul> : <p>{selectedRecipe.ingredients}</p>}
          <h3>Instructions</h3><p>{selectedRecipe.instructions}</p>
          <p><strong>Category:</strong> {selectedRecipe.category}</p>
          <p><strong>Difficulty:</strong> {selectedRecipe.difficulty}</p>
          <p><strong>Cooking Time:</strong> {selectedRecipe.cookingTime} minutes</p>
          <br />
          <button onClick={() => setPage("edit")}>✏️ Edit Recipe</button>
          <button onClick={deleteRecipe}>🗑️ Delete Recipe</button>

          <hr />
          <h2>⭐ Ratings & Reviews</h2>
          <h3>Write a Review</h3>
          <div><label>Rating:</label> <select value={rating} onChange={(e) => setRating(Number(e.target.value))}><option value={5}>⭐⭐⭐⭐⭐ 5</option><option value={4}>⭐⭐⭐⭐ 4</option><option value={3}>⭐⭐⭐ 3</option><option value={2}>⭐⭐ 2</option><option value={1}>⭐ 1</option></select></div>
          <br />
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write your review..." rows="4" cols="40" />
          <br /><br />
          <button onClick={async () => {
            const token = localStorage.getItem("token");
            if (!token) return setReviewMessage("Please login first.");
            if (!comment.trim()) return setReviewMessage("Please write a comment.");
            try {
              const response = await fetch(`${API_URL}/api/reviews/`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ recipeId: selectedRecipe._id, rating, comment: comment.trim() }) });
              const data = await response.json();
              if (!response.ok) return setReviewMessage(data.message || "Failed to add review.");
              setReviewMessage("Review added successfully!"); setComment(""); setRating(5);
              const reviewsResponse = await fetch(`${API_URL}/api/reviews/${selectedRecipe._id}`); const reviewsData = await reviewsResponse.json(); setReviews(reviewsData.reviews || []);
            } catch (error) { console.error("Create review error:", error); setReviewMessage("Unable to connect to server."); }
          }}>⭐ Submit Review</button>
          <p>{reviewMessage}</p>
          <hr />
          {reviews.map((review) => <div key={review._id}><strong>{review.user?.name || "User"}</strong><p>Rating: {review.rating}/5</p><p>{review.comment}</p></div>)}
        </div>
      )}

      {page === "edit" && selectedRecipe && <EditRecipe recipeId={selectedRecipe._id} onBack={() => setPage("details")} onUpdated={(updatedRecipe) => { setSelectedRecipe(updatedRecipe); setPage("details"); fetchRecipes(); }} />}
    </div>
  );
}

export default App;
