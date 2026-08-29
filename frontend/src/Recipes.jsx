import { useEffect, useState } from "react";

function Recipes({ onSelectRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/recipes")
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
                src={`http://127.0.0.1:5000${recipe.image}`}
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