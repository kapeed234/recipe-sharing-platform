import { useEffect, useState } from "react";
import Register from "./Register";
import Login from "./Login";
import CreateRecipe from "./CreateRecipe";
import EditRecipe from "./EditRecipe";

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

  // ================= FETCH RECIPES WITH SEARCH & FILTERS =================
const fetchRecipes = async () => {
  try {
    setMessage("Loading recipes...");

    const params = new URLSearchParams();

    // Search by recipe title
    if (search.trim() !== "") {
      params.append("search", search.trim());
    }

    // Filter by category
    if (category !== "") {
      params.append("category", category);
    }

    // Filter by difficulty
    if (difficulty !== "") {
      params.append("difficulty", difficulty);
    }

    // Filter by maximum cooking time
    if (maxTime !== "") {
      params.append("maxTime", maxTime);
    }

    const url =
      "https://recipe-sharing-platform-d6x4.onrender.com/api/recipes" +
      (params.toString()
        ? "?" + params.toString()
        : "");

    console.log("Fetching recipes:", url);

    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load recipes"
      );
    }

    setRecipes(data.recipes || []);
    setMessage("");
  } catch (error) {
    console.error("Fetch recipes error:", error);
    setMessage("Could not load recipes.");
  }
};
  // ================= LOAD RECIPES =================
  useEffect(() => {
    if (page === "recipes") {
      fetchRecipes();
    }
  }, [page]);

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setRecipes([]);
    setSelectedRecipe(null);
    setPage("login");
  };

  // ================= OPEN RECIPE =================
  const openRecipe = async (recipe) => {
  setSelectedRecipe(recipe);
  setPage("details");

  setReviews([]);
  setReviewMessage("Loading reviews...");

  try {
    const response = await fetch(
      "https://recipe-sharing-platform-d6x4.onrender.com/api/reviews/" +
        recipe._id
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load reviews"
      );
    }

    setReviews(data.reviews || []);
    setReviewMessage("");
  } catch (error) {
    console.error("Get reviews error:", error);
    setReviewMessage("Could not load reviews.");
  }
};

  // ================= DELETE RECIPE =================
  const deleteRecipe = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    if (!selectedRecipe) {
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this recipe?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        "https://recipe-sharing-platform-d6x4.onrender.com/api/reviews/" +
          selectedRecipe._id,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Recipe deleted successfully!");

        setSelectedRecipe(null);
        setPage("recipes");

        fetchRecipes();
      } else {
        alert(
          data.message || "Failed to delete recipe."
        );
      }
    } catch (error) {
      console.error("Delete recipe error:", error);
      alert("Unable to connect to server.");
    }
  };

  return (
    <div>

      {/* ================= LOGIN ================= */}
      {page === "login" && (
        <Login
          onLogin={() => setPage("recipes")}
          onRegister={() => setPage("register")}
        />
      )}

      {/* ================= REGISTER ================= */}
      {page === "register" && (
        <Register
          onRegistered={() => setPage("login")}
          onBack={() => setPage("login")}
        />
      )}

      {/* ================= RECIPES ================= */}
      {page === "recipes" && (
  <div className="recipe-container">
         <div className="recipe-header">
  <h1>🍴 Recipe Sharing Platform</h1>

  <div>
    <button onClick={() => setPage("create")}>
      ➕ Create Recipe
    </button>

    <button onClick={handleLogout}>
      🚪 Logout
    </button>
  </div>
</div>

{/* ================= SEARCH & FILTER ================= */}
<div className="filter-box">
  <h3>🔎 Search & Filter Recipes</h3>

  <div className="filter-controls">

  <input
    type="text"
    placeholder="Search recipe..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  {" "}

  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
  >
    <option value="">All Categories</option>
    <option value="Vegetarian">Vegetarian</option>
    <option value="Non-Vegetarian">
      Non-Vegetarian
    </option>
    <option value="Dessert">Dessert</option>
    <option value="Snacks">Snacks</option>
    <option value="Beverages">Beverages</option>
  </select>

  {" "}

  <select
    value={difficulty}
    onChange={(e) => setDifficulty(e.target.value)}
  >
    <option value="">All Difficulties</option>
    <option value="Easy">Easy</option>
    <option value="Medium">Medium</option>
    <option value="Hard">Hard</option>
  </select>

  {" "}

  <input
    type="number"
    placeholder="Max cooking time"
    value={maxTime}
    onChange={(e) => setMaxTime(e.target.value)}
  />

  {" "}

  <button onClick={fetchRecipes}>
    🔍 Search
  </button>

  {" "}

  <button
    onClick={() => {
      setSearch("");
      setCategory("");
      setDifficulty("");
      setMaxTime("");

      // Load all recipes again
      setTimeout(() => {
        fetchRecipes();
      }, 0);
    }}
  >
    Clear Filters
  </button>
  </div>
</div>

<hr />


          <hr />

          <p>{message}</p>

          {recipes.length === 0 && !message && (
            <p>No recipes found.</p>
          )}

          <div className="recipe-grid">

  {recipes.map((recipe) => (
    <div className="recipe-card" key={recipe._id}>

      {/* Recipe Image */}
      {recipe.image && (
        <img
          className="recipe-card-image"
          src={
            "https://recipe-sharing-platform-d6x4.onrender.com" +
            recipe.image
          }
          alt={recipe.title}
        />
      )}

      {/* Recipe Content */}
      <div className="recipe-card-content">

        <h2>{recipe.title}</h2>

        <p className="recipe-description">
          {recipe.description}
        </p>

        <div className="recipe-info">

          <p>
            <strong>Category</strong>
            <span>{recipe.category}</span>
          </p>

          <p>
            <strong>Difficulty</strong>
            <span>{recipe.difficulty}</span>
          </p>

          <p>
            <strong>Cooking Time</strong>
            <span>
              ⏱️ {recipe.cookingTime} minutes
            </span>
          </p>

        </div>

        <button
          className="view-recipe-button"
          onClick={() => openRecipe(recipe)}
        >
          👁️ View Recipe
        </button>

      </div>

    </div>
  ))}

</div>
        </div>
      )}

      {/* ================= CREATE RECIPE ================= */}
      {page === "create" && (
        <CreateRecipe
          onBack={() => setPage("recipes")}
          onCreated={() => {
            setPage("recipes");
            fetchRecipes();
          }}
        />
      )}

      {/* ================= RECIPE DETAILS ================= */}
      {page === "details" && selectedRecipe && (
  <div className="recipe-details-page">

          <button
            onClick={() => setPage("recipes")}
          >
            ← Back
          </button>

          <h1>{selectedRecipe.title}</h1>

          {selectedRecipe.image && (
            <img
              src={
                "https://recipe-sharing-platform-d6x4.onrender.com" +
                selectedRecipe.image
              }
              alt={selectedRecipe.title}
              width="400"
            />
          )}

          <h3>Description</h3>
          <p>{selectedRecipe.description}</p>

          <h3>Ingredients</h3>

          {Array.isArray(selectedRecipe.ingredients) ? (
            <ul>
              {selectedRecipe.ingredients.map(
                (ingredient, index) => (
                  <li key={index}>
                    {ingredient}
                  </li>
                )
              )}
            </ul>
          ) : (
            <p>{selectedRecipe.ingredients}</p>
          )}

          <h3>Instructions</h3>
          <p>{selectedRecipe.instructions}</p>

          <p>
            <strong>Category:</strong>{" "}
            {selectedRecipe.category}
          </p>

          <p>
            <strong>Difficulty:</strong>{" "}
            {selectedRecipe.difficulty}
          </p>

          <p>
            <strong>Cooking Time:</strong>{" "}
            {selectedRecipe.cookingTime} minutes
          </p>

          <br />

          {/* ================= REVIEWS ================= */}
<hr />

<h2>⭐ Ratings & Reviews</h2>

<h3>Write a Review</h3>

<div>
  <label>Rating:</label>
  {" "}

  <select
    value={rating}
    onChange={(e) =>
      setRating(Number(e.target.value))
    }
  >
    <option value={5}>⭐⭐⭐⭐⭐ 5</option>
    <option value={4}>⭐⭐⭐⭐ 4</option>
    <option value={3}>⭐⭐⭐ 3</option>
    <option value={2}>⭐⭐ 2</option>
    <option value={1}>⭐ 1</option>
  </select>
</div>

<br />

<div>
  <label>Comment:</label>
  <br />

  <textarea
    value={comment}
    onChange={(e) =>
      setComment(e.target.value)
    }
    placeholder="Write your review..."
    rows="4"
    cols="40"
  />
</div>

<br />

<button
  onClick={async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setReviewMessage("Please login first.");
      return;
    }

    if (!comment.trim()) {
      setReviewMessage(
        "Please write a comment."
      );
      return;
    }

    try {
      const response = await fetch(
        "https://recipe-sharing-platform-d6x4.onrender.com/api/reviews/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify({
            recipeId: selectedRecipe._id,
            rating: rating,
            comment: comment.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setReviewMessage(
          data.message || "Failed to add review."
        );
        return;
      }

      setReviewMessage(
        "Review added successfully!"
      );

      setComment("");
      setRating(5);

      // Reload reviews
      const reviewsResponse = await fetch(
        "https://recipe-sharing-platform-d6x4.onrender.com/api/reviews/" +
          selectedRecipe._id
      );

      const reviewsData =
        await reviewsResponse.json();

      setReviews(reviewsData.reviews || []);

    } catch (error) {
      console.error(
        "Create review error:",
        error
      );

      setReviewMessage(
        "Unable to connect to server."
      );
    }
  }}
>
  ⭐ Submit Review
</button>

<p>{reviewMessage}</p>

<hr />

{editingReview && (
  <div>
    <hr />

    <h3>✏️ Edit Your Review</h3>

    <div>
      <label>Rating: </label>

      <select
        value={editRating}
        onChange={(e) =>
          setEditRating(Number(e.target.value))
        }
      >
        <option value={5}>⭐⭐⭐⭐⭐ 5</option>
        <option value={4}>⭐⭐⭐⭐ 4</option>
        <option value={3}>⭐⭐⭐ 3</option>
        <option value={2}>⭐⭐ 2</option>
        <option value={1}>⭐ 1</option>
      </select>
    </div>

    <br />

    <div>
      <label>Comment:</label>
      <br />

      <textarea
        value={editComment}
        onChange={(e) =>
          setEditComment(e.target.value)
        }
        rows="4"
        cols="40"
      />
    </div>

    <br />

    <button
      onClick={async () => {
        const token = localStorage.getItem("token");

        if (!token) {
          setReviewMessage("Please login first.");
          return;
        }

        if (!editComment.trim()) {
          setReviewMessage(
            "Please write a comment."
          );
          return;
        }

        try {
          const response = await fetch(
            "https://recipe-sharing-platform-d6x4.onrender.com/api/reviews/" +
              editingReview._id,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
              },
              body: JSON.stringify({
                rating: editRating,
                comment: editComment.trim()
              })
            }
          );

          const data = await response.json();

          if (!response.ok) {
            setReviewMessage(
              data.message ||
                "Failed to update review."
            );
            return;
          }

          // Update the review on screen
          setReviews((currentReviews) =>
            currentReviews.map((item) =>
              item._id === editingReview._id
                ? data.review
                : item
            )
          );

          setEditingReview(null);
          setEditRating(5);
          setEditComment("");

          setReviewMessage(
            "Review updated successfully!"
          );

        } catch (error) {
          console.error(
            "Update review error:",
            error
          );

          setReviewMessage(
            "Unable to connect to server."
          );
        }
      }}
    >
      💾 Update Review
    </button>

    {" "}

    <button
      onClick={() => {
        setEditingReview(null);
        setEditRating(5);
        setEditComment("");
      }}
    >
      Cancel
    </button>

    <p>{reviewMessage}</p>

    <hr />
  </div>
)}

<h3>All Reviews</h3>

{reviews.length === 0 ? (
  <p>No reviews yet.</p>
) : (
  reviews.map((review) => {
    const currentUser = JSON.parse(
      localStorage.getItem("user")
    );

    const currentUserId = currentUser?._id || currentUser?.id;
    const reviewUserId =
      review.user?._id || review.user?.id || review.user;

    const isOwner =
      currentUserId &&
      reviewUserId &&
      String(currentUserId) === String(reviewUserId);

    return (
      <div key={review._id}>
        <strong>
          {review.user?.name || "User"}
        </strong>

        <p>
          {"⭐".repeat(Number(review.rating))}
        </p>

        <p>{review.comment}</p>

        {isOwner && (
          <div>
            <button
  onClick={() => {
    setEditingReview(review);
    setEditRating(Number(review.rating));
    setEditComment(review.comment);
    setReviewMessage("");
  }}
>
  ✏️ Edit Review
</button>

            {" "}

            <button
              onClick={async () => {
                const token =
                  localStorage.getItem("token");

                const confirmDelete =
                  window.confirm(
                    "Are you sure you want to delete this review?"
                  );

                if (!confirmDelete) {
                  return;
                }

                try {
                  const response = await fetch(
                    "https://recipe-sharing-platform-d6x4.onrender.com/api/reviews/" +
                      review._id,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization:
                          "Bearer " + token
                      }
                    }
                  );

                  const data =
                    await response.json();

                  if (!response.ok) {
                    alert(
                      data.message ||
                        "Failed to delete review."
                    );
                    return;
                  }

                  alert(
                    "Review deleted successfully!"
                  );

                  setReviews((currentReviews) =>
                    currentReviews.filter(
                      (item) =>
                        item._id !== review._id
                    )
                  );

                } catch (error) {
                  console.error(
                    "Delete review error:",
                    error
                  );

                  alert(
                    "Unable to connect to server."
                  );
                }
              }}
            >
              🗑️ Delete Review
            </button>
          </div>
        )}

        <hr />
      </div>
    );
  })
)}

          {/* EDIT BUTTON */}
          <button
            onClick={() => setPage("edit")}
          >
            ✏️ Edit Recipe
          </button>

          {" "}

          {/* DELETE BUTTON */}
          <button
            onClick={deleteRecipe}
          >
            🗑️ Delete Recipe
          </button>

          {" "}

          <button
            onClick={() => setPage("recipes")}
          >
            ← Back to Recipes
          </button>

        </div>
      )}

      {/* ================= EDIT RECIPE ================= */}
      {page === "edit" && selectedRecipe && (
        <EditRecipe
          recipeId={selectedRecipe._id}
          onBack={() => setPage("details")}
          onUpdated={() => {
            fetchRecipes();
            setPage("recipes");
          }}
        />
      )}

    </div>
  );
}

export default App;