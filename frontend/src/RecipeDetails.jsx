import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://recipe-sharing-backend-cltn.onrender.com";

function RecipeDetails({ recipeId, onBack }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/recipes/${recipeId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Recipe not found");
        }

        return response.json();
      })
      .then((data) => {
        setRecipe(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load recipe");
        setLoading(false);
      });
  }, [recipeId]);

  if (loading) {
    return <p>Loading recipe...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={onBack}>Back to Recipes</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack}>
        ← Back to Recipes
      </button>

      {recipe.image && (
        <img
          src={recipe.image.startsWith("http") ? recipe.image : `${API_URL}${recipe.image}`}
          alt={recipe.title}
          width="400"
        />
      )}

      <h1>{recipe.title}</h1>

      <p>{recipe.description}</p>

      <p>
        <strong>Category:</strong> {recipe.category}
      </p>

      <p>
        <strong>Difficulty:</strong> {recipe.difficulty}
      </p>

      <p>
        <strong>Cooking Time:</strong>{" "}
        {recipe.cookingTime} minutes
      </p>

      <h2>Ingredients</h2>

      <ul>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>

      <h2>Instructions</h2>

      <p>{recipe.instructions}</p>

      {recipe.author && (
        <p>
          <strong>Author:</strong> {recipe.author.name}
        </p>
      )}
    </div>
  );
}

export default RecipeDetails;