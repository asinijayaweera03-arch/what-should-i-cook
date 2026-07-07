import { useState } from "react";
import "./App.css";

const suggestionChips = ["eggs", "spinach", "rice", "garlic", "onion", "tomato", "pasta", "chicken", "cheese", "potato"];

export default function App() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div className="hero-content">
          <p className="eyebrow">Smart recipe finder</p>
          <h1>What should I cook?</h1>
          <p className="hero-text">
            Enter what you already have at home and discover delicious meals you can make today.
          </p>

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

        {!loading && !error && recipes.length === 0 && !ingredients && (
          <div className="status-card empty">
            Add a few ingredients to get started and we’ll suggest something tasty.
          </div>
        )}

        <div className="recipe-list">
          {recipes.map((recipe, index) => (
            <article key={`${recipe.name}-${index}`} className="recipe-card">
              <div className="recipe-head">
                <h3>{recipe.name}</h3>
                <span className="recipe-badge">Fresh pick</span>
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
}import { useState, useEffect } from "react";

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
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>What Should I Cook?</h1>
        <button onClick={() => setShowFavorites(!showFavorites)}>
          {showFavorites ? "Back to search" : `⭐ Favorites (${favorites.length})`}
        </button>
      </div>

      {!showFavorites && (
        <form onSubmit={handleSubmit}>
          <input
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. eggs, spinach, rice, garlic"
            style={{ width: "100%", padding: 8 }}
          />
          <button type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Thinking..." : "Find recipes"}
          </button>
        </form>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {showFavorites && favorites.length === 0 && (
        <p style={{ marginTop: 20, color: "#888" }}>No favorites saved yet.</p>
      )}

      {listToShow.map((r, i) => (
        <div key={i} style={{ marginTop: 20, borderTop: "1px solid #ddd", paddingTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>{r.name}</h3>
            <button onClick={() => toggleFavorite(r)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>
              {isFavorited(r) ? "⭐" : "☆"}
            </button>
          </div>
          <p><strong>Missing:</strong> {r.missingIngredients.length ? r.missingIngredients.join(", ") : "None"}</p>
          <p>{r.instructions}</p>
        </div>
      ))}
    </div>
  );
}