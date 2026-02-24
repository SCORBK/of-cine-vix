import { useState } from "react";
import { Heart, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import { useMovieLists } from "@/contexts/MovieListsContext";
import movieData, { heroMovie } from "@/data/movies";

type Tab = "favorites" | "watched";

const allMovies = [heroMovie, ...movieData];

const MyList = () => {
  const [tab, setTab] = useState<Tab>("favorites");
  const { favorites, watched } = useMovieLists();

  const favoriteMovies = allMovies.filter((m) => favorites.includes(m.id));
  const watchedMovies = allMovies.filter((m) => watched.includes(m.id));
  const currentMovies = tab === "favorites" ? favoriteMovies : watchedMovies;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-6 md:px-12 pb-20">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Mi Lista</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {([
            { key: "favorites" as Tab, label: "Favoritos", icon: Heart, count: favorites.length },
            { key: "watched" as Tab, label: "Vistos", icon: Eye, count: watched.length },
          ]).map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="myListTab"
                    className="absolute inset-0 rounded-xl bg-primary shadow-lg shadow-primary/25"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {t.label}
                  <span className="bg-background/20 rounded-full px-2 py-0.5 text-xs">{t.count}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {currentMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                {tab === "favorites" ? (
                  <Heart className="w-12 h-12 mb-4 opacity-30" />
                ) : (
                  <Eye className="w-12 h-12 mb-4 opacity-30" />
                )}
                <p className="text-lg font-medium">
                  {tab === "favorites" ? "No tienes favoritos aún" : "No has marcado películas como vistas"}
                </p>
                <p className="text-sm mt-1">
                  {tab === "favorites"
                    ? "Marca películas con ❤️ para verlas aquí"
                    : "Marca películas con 👁 para llevar un registro"}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {currentMovies.map((movie, i) => (
                  <MovieCard key={movie.id} movie={movie} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyList;
