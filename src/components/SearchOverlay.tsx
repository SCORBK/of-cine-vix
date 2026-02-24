import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import movieData, { heroMovie, Movie } from "@/data/movies";

const allMovies = [heroMovie, ...movieData];

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SearchOverlay = ({ open, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const results = query.trim().length > 0
    ? allMovies.filter(
        (m) =>
          m.title.toLowerCase().includes(query.toLowerCase()) ||
          m.genre.toLowerCase().includes(query.toLowerCase()) ||
          m.year.toString().includes(query)
      )
    : [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-[71] max-w-2xl mx-auto px-4 pt-8"
          >
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar películas, géneros..."
                className="w-full h-14 pl-12 pr-12 rounded-2xl bg-card border border-border text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                maxLength={100}
              />
              <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Results */}
            <div className="mt-3 max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-card/95 backdrop-blur-xl">
              {query.trim().length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Escribe para buscar películas</p>
                  <p className="text-xs mt-1 text-muted-foreground/60">Busca por título, género o año</p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">No se encontraron resultados para "<span className="text-foreground">{query}</span>"</p>
                </div>
              ) : (
                <div className="p-2">
                  <p className="px-3 py-2 text-xs text-muted-foreground">{results.length} resultado{results.length !== 1 ? "s" : ""}</p>
                  {results.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => { onClose(); }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/60 transition-colors text-left"
                    >
                      <img src={movie.image} alt={movie.title} className="w-10 h-14 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{movie.title}</p>
                        <p className="text-xs text-muted-foreground">{movie.genre} · {movie.year} · ⭐ {movie.rating}</p>
                      </div>
                      <span className="text-xs text-muted-foreground/50">{movie.duration}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
