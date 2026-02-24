import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface MovieListsContextType {
  favorites: number[];
  watched: number[];
  toggleFavorite: (movieId: number) => void;
  toggleWatched: (movieId: number) => void;
  isFavorite: (movieId: number) => boolean;
  isWatched: (movieId: number) => boolean;
}

const MovieListsContext = createContext<MovieListsContextType | null>(null);

function loadFromStorage(key: string): number[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function MovieListsProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>(() => loadFromStorage("velora_favorites"));
  const [watched, setWatched] = useState<number[]>(() => loadFromStorage("velora_watched"));

  useEffect(() => {
    localStorage.setItem("velora_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("velora_watched", JSON.stringify(watched));
  }, [watched]);

  const toggleFavorite = useCallback((movieId: number) => {
    setFavorites((prev) =>
      prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]
    );
  }, []);

  const toggleWatched = useCallback((movieId: number) => {
    setWatched((prev) =>
      prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]
    );
  }, []);

  const isFavorite = useCallback((movieId: number) => favorites.includes(movieId), [favorites]);
  const isWatched = useCallback((movieId: number) => watched.includes(movieId), [watched]);

  return (
    <MovieListsContext.Provider value={{ favorites, watched, toggleFavorite, toggleWatched, isFavorite, isWatched }}>
      {children}
    </MovieListsContext.Provider>
  );
}

export function useMovieLists() {
  const ctx = useContext(MovieListsContext);
  if (!ctx) throw new Error("useMovieLists must be used within MovieListsProvider");
  return ctx;
}
