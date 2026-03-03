import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MovieListsContextType {
  favorites: string[];
  watched: string[];
  toggleFavorite: (movieId: string) => void;
  toggleWatched: (movieId: string) => void;
  isFavorite: (movieId: string) => boolean;
  isWatched: (movieId: string) => boolean;
}

const MovieListsContext = createContext<MovieListsContextType | null>(null);

export function MovieListsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [watched, setWatched] = useState<string[]>([]);

  const fetchLists = useCallback(async () => {
    if (!user) { setFavorites([]); setWatched([]); return; }
    const { data } = await supabase
      .from("user_movie_lists")
      .select("movie_id, list_type")
      .eq("user_id", user.id);
    if (data) {
      setFavorites(data.filter(d => d.list_type === "favorite").map(d => d.movie_id));
      setWatched(data.filter(d => d.list_type === "watched").map(d => d.movie_id));
    }
  }, [user]);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  const toggleFavorite = useCallback(async (movieId: string) => {
    if (!user) return;
    if (favorites.includes(movieId)) {
      await supabase.from("user_movie_lists").delete().eq("user_id", user.id).eq("movie_id", movieId).eq("list_type", "favorite");
      setFavorites(prev => prev.filter(id => id !== movieId));
    } else {
      await supabase.from("user_movie_lists").insert({ user_id: user.id, movie_id: movieId, list_type: "favorite" });
      setFavorites(prev => [...prev, movieId]);
    }
  }, [user, favorites]);

  const toggleWatched = useCallback(async (movieId: string) => {
    if (!user) return;
    if (watched.includes(movieId)) {
      await supabase.from("user_movie_lists").delete().eq("user_id", user.id).eq("movie_id", movieId).eq("list_type", "watched");
      setWatched(prev => prev.filter(id => id !== movieId));
    } else {
      await supabase.from("user_movie_lists").insert({ user_id: user.id, movie_id: movieId, list_type: "watched" });
      setWatched(prev => [...prev, movieId]);
    }
  }, [user, watched]);

  const isFavorite = useCallback((movieId: string) => favorites.includes(movieId), [favorites]);
  const isWatched = useCallback((movieId: string) => watched.includes(movieId), [watched]);

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
