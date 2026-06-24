import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  getMyFavoriteTemples,
  toggleFavorite as toggleFavoriteAPI,
} from "../services/templeService";

const FavoritesContext = createContext({
  favorites:       [],
  loading:         false,
  addFavorite:     () => {},
  removeFavorite:  () => {},
  toggleFavorite:  () => {},
  isFavorite:      () => false,
  clearAll:        () => {},
  refresh:         () => {},
});

// ── Backend Temple doc → shape used across the UI (TempleCard, favorites page, etc.) ──
const normalize = (t) => ({
  id:         t._id || t.id,
  _id:        t._id || t.id,
  name:       t.name,
  slug:       t.slug,
  image:      t.images?.[0] || "/images/placeholder-temple.jpg",
  location:   `${t.district || ""}${t.district && t.state ? ", " : ""}${t.state || ""}`,
  deity:      t.deity,
  deityColor: t.deityColor,
  rating:     t.rating,
  type:       "temple",
});

export function FavoritesProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading]   = useState(false);

  // ── Backend se favorites load karo jab user logged in ho ──
  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }
    try {
      setLoading(true);
      const temples = await getMyFavoriteTemples();
      setFavorites(temples.map(normalize));
    } catch (err) {
      console.error("Failed to load favorites:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Add (optimistic) ──
  const addFavorite = async (item) => {
    const templeId = item.id || item._id;
    if (!templeId || !isAuthenticated) return;

    setFavorites((prev) => (prev.find((f) => f.id === templeId) ? prev : [...prev, normalize(item)]));

    try {
      await toggleFavoriteAPI(templeId);
    } catch (err) {
      console.error("Add favorite failed:", err);
      refresh(); // resync on failure
    }
  };

  // ── Remove (optimistic) ──
  const removeFavorite = async (id) => {
    if (!isAuthenticated) return;
    setFavorites((prev) => prev.filter((f) => f.id !== id));

    try {
      await toggleFavoriteAPI(id);
    } catch (err) {
      console.error("Remove favorite failed:", err);
      refresh();
    }
  };

  // ── Toggle (optimistic UI + real backend call) ──
  const toggleFavorite = async (item) => {
    const templeId = item.id || item._id;
    if (!templeId) return;

    if (!isAuthenticated) {
      window.location.href = "/auth/login";
      return;
    }

    const exists = favorites.find((f) => f.id === templeId);

    setFavorites((prev) =>
      exists ? prev.filter((f) => f.id !== templeId) : [...prev, normalize(item)]
    );

    try {
      await toggleFavoriteAPI(templeId);
    } catch (err) {
      console.error("Toggle favorite failed:", err);
      refresh(); // resync with server truth on failure
    }
  };

  const isFavorite = (id) => favorites.some((f) => f.id === id);

  const clearAll = async () => {
    if (!isAuthenticated) return;
    const ids = favorites.map((f) => f.id);
    setFavorites([]);
    try {
      await Promise.all(ids.map((id) => toggleFavoriteAPI(id)));
    } catch (err) {
      console.error("Clear all favorites failed:", err);
      refresh();
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, loading, addFavorite, removeFavorite, toggleFavorite, isFavorite, clearAll, refresh }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);