import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Heart, MessageCircle, Share2, Bookmark, ArrowLeft,
  ChevronUp, ChevronDown, Play, Star, Clock, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import movieData, { heroMovie, Movie } from "@/data/movies";
import { useMovieLists } from "@/contexts/MovieListsContext";

const allMovies = [heroMovie, ...movieData];

interface MovieComment {
  id: number;
  user: string;
  avatar: string;
  text: string;
  time: string;
}

const mockComments: MovieComment[] = [
  { id: 1, user: "Ana García", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop", text: "¡Esta película es increíble! 🔥", time: "2h" },
  { id: 2, user: "Diego López", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=40&h=40&fit=crop", text: "La mejor que he visto este año", time: "5h" },
  { id: 3, user: "María Torres", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop", text: "Se las recomiendo mucho 👏", time: "1d" },
];

const MovieFeed = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const { toggleFavorite, isFavorite } = useMovieLists();
  const isScrolling = useRef(false);

  const movie = allMovies[currentIndex];

  const goTo = useCallback((dir: "up" | "down") => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    setTimeout(() => (isScrolling.current = false), 600);

    setCurrentIndex((prev) => {
      if (dir === "up") return prev > 0 ? prev - 1 : prev;
      return prev < allMovies.length - 1 ? prev + 1 : prev;
    });
    setShowComments(false);
  }, []);

  // Wheel / touch scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let touchStartY = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) > 30) {
        goTo(e.deltaY > 0 ? "down" : "up");
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        goTo(diff > 0 ? "down" : "up");
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [goTo]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goTo("down");
      if (e.key === "ArrowUp") goTo("up");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  const toggleLike = (id: number) => {
    setLikes((p) => ({ ...p, [id]: !p[id] }));
    toggleFavorite(id);
  };

  const toggleSave = (id: number) => {
    setSaved((p) => ({ ...p, [id]: !p[id] }));
  };

  return (
    <div ref={containerRef} className="fixed inset-0 bg-background z-50 overflow-hidden select-none">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-foreground bg-background/30 backdrop-blur-sm hover:bg-background/50 gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
        <h2 className="text-sm font-bold text-foreground bg-background/30 backdrop-blur-sm px-4 py-1.5 rounded-full">
          <Flame className="w-3.5 h-3.5 inline mr-1 text-orange-400" />
          Recomendaciones
        </h2>
      </div>

      {/* Progress dots */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1">
        {allMovies.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex ? "h-5 bg-primary" : "h-1.5 bg-foreground/20"
            }`}
          />
        ))}
      </div>

      {/* Movie card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 flex flex-col"
        >
          {/* Image */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src={movie.image}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center cursor-pointer shadow-2xl shadow-primary/40"
              >
                <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
              </motion.div>
            </div>
          </div>

          {/* Movie info overlay */}
          <div className="absolute bottom-0 left-0 right-16 p-5 pb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full">
                {movie.genre}
              </span>
              <span className="text-[10px] text-foreground/70 flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" fill="currentColor" /> {movie.rating}
              </span>
              <span className="text-[10px] text-foreground/70 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {movie.duration}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight mb-1">
              {movie.title}
            </h2>
            <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2 max-w-md">
              {movie.description}
            </p>
            <p className="text-[10px] text-foreground/40 mt-2">
              Recomendado por <span className="text-primary font-semibold">Velora</span> • {movie.year}
            </p>
          </div>

          {/* Action buttons (right side) */}
          <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
            <ActionBtn
              icon={Heart}
              label={isFavorite(movie.id) ? "❤️" : `${Math.floor(Math.random() * 500 + 100)}`}
              active={isFavorite(movie.id)}
              activeColor="text-red-500"
              onClick={() => toggleLike(movie.id)}
            />
            <ActionBtn
              icon={MessageCircle}
              label={`${mockComments.length}`}
              onClick={() => setShowComments(!showComments)}
            />
            <ActionBtn
              icon={Share2}
              label="Compartir"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: movie.title, text: `¡Mira ${movie.title} en Velora!` });
                }
              }}
            />
            <ActionBtn
              icon={Bookmark}
              label="Guardar"
              active={saved[movie.id]}
              activeColor="text-yellow-400"
              onClick={() => toggleSave(movie.id)}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        <button
          onClick={() => goTo("up")}
          disabled={currentIndex === 0}
          className="w-8 h-8 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-background/50 transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <span className="text-[10px] text-foreground/50 font-medium tabular-nums">
          {currentIndex + 1} / {allMovies.length}
        </span>
        <button
          onClick={() => goTo("down")}
          disabled={currentIndex === allMovies.length - 1}
          className="w-8 h-8 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-background/50 transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Comments panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border rounded-t-2xl max-h-[50vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <h3 className="text-sm font-semibold text-foreground">{mockComments.length} Comentarios</h3>
              <button onClick={() => setShowComments(false)} className="text-muted-foreground hover:text-foreground text-xs">
                Cerrar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mockComments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <img src={c.avatar} alt={c.user} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{c.user}</span>
                      <span className="text-[10px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="text-xs text-foreground/80 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function ActionBtn({
  icon: Icon,
  label,
  active,
  activeColor,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  activeColor?: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1"
    >
      <div className={`w-10 h-10 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center transition-colors ${
        active ? activeColor : "text-foreground"
      }`}>
        <Icon className="w-5 h-5" fill={active ? "currentColor" : "none"} />
      </div>
      <span className="text-[10px] text-foreground/70 font-medium">{label}</span>
    </motion.button>
  );
}

export default MovieFeed;
