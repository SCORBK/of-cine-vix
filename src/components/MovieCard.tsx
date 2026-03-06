import { Play, Heart, Eye, Flag, Share2, Film, Star } from "lucide-react";
import { useState } from "react";
import { useMovieLists } from "@/contexts/MovieListsContext";
import ReportMovieModal from "@/components/ReportMovieModal";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import type { DbMovie } from "@/types/movie";

interface MovieCardProps {
  movie: DbMovie;
  index: number;
}

const MovieCard = ({ movie, index }: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const { toggleFavorite, toggleWatched, isFavorite, isWatched } = useMovieLists();

  const fav = isFavorite(movie.id);
  const seen = isWatched(movie.id);

  return (
    <>
      <div
        className="relative flex-shrink-0 w-[160px] md:w-[200px] group cursor-pointer"
        style={{ animationDelay: `${index * 80}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card border border-border/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:border-primary/40">
          {movie.image_url ? (
            <img src={movie.image_url} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <Film className="w-10 h-10 text-muted-foreground" />
            </div>
          )}

          {seen && !isHovered && (
            <div className="absolute top-2 left-2">
              <div className="flex items-center gap-1 bg-primary/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                <Eye className="w-3 h-3 text-primary-foreground" />
                <span className="text-xs font-bold text-primary-foreground">Visto</span>
              </div>
            </div>
          )}

          <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} />

          <div className={`absolute inset-0 flex flex-col justify-end p-3 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={(e) => { e.stopPropagation(); setPlayerOpen(true); }}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors">
                <Play className="w-4 h-4 text-primary-foreground fill-current" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(movie.id); }}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${fav ? "bg-destructive border-destructive text-destructive-foreground" : "bg-secondary border-border text-foreground hover:bg-muted"}`}>
                <Heart className={`w-4 h-4 ${fav ? "fill-current" : ""}`} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); toggleWatched(movie.id); }}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${seen ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border text-foreground hover:bg-muted"}`}>
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); navigator.share?.({ title: movie.title, text: movie.description || "" }); }}
                className="w-8 h-8 rounded-full border border-border bg-secondary text-foreground flex items-center justify-center hover:bg-primary/10 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setReportOpen(true); }}
                className="w-8 h-8 rounded-full border border-border bg-secondary text-muted-foreground flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors">
                <Flag className="w-4 h-4" />
              </button>
            </div>
            {movie.rating && (
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-3 h-3 text-accent fill-accent" />
                <span className="text-xs font-semibold text-accent">{movie.rating}</span>
              </div>
            )}
          </div>

          {movie.rating && (
            <div className={`absolute top-2 right-2 transition-opacity duration-300 ${isHovered ? "opacity-0" : "opacity-100"}`}>
              <div className="flex items-center gap-1 bg-background/70 backdrop-blur-sm rounded-full px-2 py-0.5">
                <Star className="w-3 h-3 text-accent fill-accent" />
                <span className="text-xs font-bold text-foreground">{movie.rating}</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 px-1">
          <h3 className="text-sm font-semibold text-foreground truncate">{movie.title}</h3>
          <p className="text-xs text-muted-foreground">{movie.year || "—"} · {movie.genre || "—"}</p>
        </div>
      </div>

      <ReportMovieModal movie={movie} open={reportOpen} onClose={() => setReportOpen(false)} />
      <VideoPlayerModal movie={movie} open={playerOpen} onClose={() => setPlayerOpen(false)} />
    </>
  );
};

export default MovieCard;
