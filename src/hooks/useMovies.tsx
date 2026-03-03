import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DbMovie } from "@/types/movie";

export function useMovies() {
  const [movies, setMovies] = useState<DbMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("movies").select("*").order("created_at", { ascending: false });
      setMovies((data as DbMovie[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const heroMovie = movies[0] || null;

  const categorize = () => {
    if (movies.length === 0) return [];
    const genreMap = new Map<string, DbMovie[]>();
    movies.forEach(m => {
      const genre = m.genre || "Otros";
      if (!genreMap.has(genre)) genreMap.set(genre, []);
      genreMap.get(genre)!.push(m);
    });
    return Array.from(genreMap.entries()).map(([name, movies]) => ({ name, movies }));
  };

  return { movies, heroMovie, categories: categorize(), loading };
}
