import { useState, useEffect } from "react";
import "./App.css";

const suggestionChips = ["eggs", "spinach", "rice", "garlic", "onion", "tomato", "pasta", "chicken", "cheese", "potato"];

const FAVORITES_KEY = "wsic_favorites";

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export default function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  function isFavorited(recipe) {
    return favorites.some((f) => f.name === recipe.name);
  }

  function toggleFavorite(recipe) {
    let updated;
    if (isFavorited(recipe)) {
      updated = favorites.filter((f) => f.name !== recipe.name);
    } else {
      updated = [...favorites, recipe];
    }
    setFavorites(updated);
    saveFavorites(updated);
  }

  function addIngredient(ingredient) {
    setIngredients((current) => {
      const trimmed = current.trim();
      if (!trimmed) return ingredient;

      const values = trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (values.includes(ingredient)) return trimmed;

      return `${trimmed}, ${ingredient}`;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRecipes([]);
    setShowFavorites(false);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setRecipes(data.recipes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const listToShow = showFavorites ? favorites : recipes;

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div className="hero-content">
          <div className="hero-top-row">
            <p className="eyebrow">Smart recipe finder</p>
            <button
              type="button"
              className="favorites-toggle"
              onClick={() => setShowFavorites((prev) => !prev)}
            >
              {showFavorites ? "Back to search" : `⭐ Favorites (${favorites.length})`}
            </button>
          </div>

          <h1>What should I cook?</h1>
          <p className="hero-text">
            Enter what you already have at home and discover delicious meals you can make today.
          </p>

          {!showFavorites && (
            <>
              <form className="search-form" onSubmit={handleSubmit}>
                <input
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="e.g. eggs, spinach, rice, garlic"
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Thinking..." : "Find recipes"}
                </button>
              </form>

              <div className="chip-row" aria-label="Example ingredients">
                {suggestionChips.map((chip) => (
                  <button key={chip} type="button" className="chip" onClick={() => addIngredient(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      <main className="results-area">
        {loading && (
          <div className="status-card loading">
            <span className="dot" />
            Matching recipes to your ingredients...
          </div>
        )}

        {error && <div className="status-card error">{error}</div>}

        {!loading && !error && !showFavorites && recipes.length === 0 && !ingredients && (
          <div className="status-card empty">
            Add a few ingredients to get started and we’ll suggest something tasty.
          </div>
        )}

        {showFavorites && favorites.length === 0 && (
          <div className="status-card empty">
            No favorites saved yet. Star a recipe to keep it here.
          </div>
        )}

        <div className="recipe-list">
          {listToShow.map((recipe, index) => (
            <article key={`${recipe.name}-${index}`} className="recipe-card">
              <div className="recipe-head">
                <h3>{recipe.name}</h3>
                <div className="recipe-head-actions">
                  <span className="recipe-badge">Fresh pick</span>
                  <button
                    type="button"
                    className="favorite-btn"
                    onClick={() => toggleFavorite(recipe)}
                    aria-label={isFavorited(recipe) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorited(recipe) ? "⭐" : "☆"}
                  </button>
                </div>
              </div>

              <div className="meta-block">
                <span className="meta-label">Missing ingredients</span>
                {recipe.missingIngredients.length ? (
                  <div className="chip-row">
                    {recipe.missingIngredients.map((item) => (
                      <span key={item} className="chip secondary">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="meta-text">You have everything you need for this one.</p>
                )}
              </div>

              <p className="recipe-instructions">{recipe.instructions}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}