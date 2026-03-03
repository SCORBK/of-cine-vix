import { useState, useEffect } from "react";
import { Heart, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import { useMovieLists } from "@/contexts/MovieListsContext";
import { supabase } from "@/integrations/supabase/client";
import type { DbMovie } from "@/types/movie";

type Tab = "favorites" | "watched";

const MyList = () => {
  const [tab, setTab] = useState<Tab>("favorites");
  const { favorites, watched } = useMovieLists();
  const [favMovies, setFavMovies] = useState<DbMovie[]>([]);
  const [watchedMovies, setWatchedMovies] = useState<DbMovie[]>([]);

  useEffect(() => {
    const fetchMovies = async (ids: string[], setter: (m: DbMovie[]) => void) => {
      if (ids.length === 0) { setter([]); return; }
      const { data } = await supabase.from("movies").select("*").in("id", ids);
      setter((data as DbMovie[]) || []);
    };
    fetchMovies(favorites, setFavMovies);
    fetchMovies(watched, setWatchedMovies);
  }, [favorites, watched]);

  const currentMovies = tab === "favorites" ? favMovies : watchedMovies;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-6 md:px-12 pb-20">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Mi Lista</h1>
        <div className="flex gap-2 mb-8">
          {([
            { key: "favorites" as Tab, label: "Favoritos", icon: Heart, count: favorites.length },
            { key: "watched" as Tab, label: "Vistos", icon: Eye, count: watched.length },
          ]).map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {isActive && (
                  <motion.div layoutId="myListTab" className="absolute inset-0 rounded-xl bg-primary shadow-lg shadow-primary/25"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10 flex items-center gap-2"><Icon className="w-4 h-4" /> {t.label}
                  <span className="bg-background/20 rounded-full px-2 py-0.5 text-xs">{t.count}</span>
                </span>
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {currentMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                {tab === "favorites" ? <Heart className="w-12 h-12 mb-4 opacity-30" /> : <Eye className="w-12 h-12 mb-4 opacity-30" />}
                <p className="text-lg font-medium">{tab === "favorites" ? "No tienes favoritos aún" : "No has marcado películas como vistas"}</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {currentMovies.map((movie, i) => <MovieCard key={movie.id} movie={movie} index={i} />)}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyList;
