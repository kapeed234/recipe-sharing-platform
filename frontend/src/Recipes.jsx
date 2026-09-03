import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://recipe-sharing-backend-cltn.onrender.com";

function Recipes({ onSelectRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/recipes`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }

        return response.json();
      })
      .then((data) => {
        setRecipes(data.recipes);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load recipes");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading recipes...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>All Recipes</h1>

      {recipes.length === 0 ? (
        <p>No recipes available.</p>
      ) : (
        recipes.map((recipe) => (
          <div key={recipe._id}>
            {recipe.image && (
              <img
                src={recipe.image.startsWith("http") ? recipe.image : `${API_URL}${recipe.image}`}
                alt={recipe.title}
                width="300"
              />
            )}

            <h2
              onClick={() => onSelectRecipe(recipe._id)}
              style={{ cursor: "pointer" }}
         >
            {recipe.title}
            </h2> 

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

            {recipe.author && (
              <p>
                <strong>Author:</strong> {recipe.author.name}
              </p>
            )}

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Recipes;