import { Play, Plus, Star } from "lucide-react";
import { heroMovie } from "@/data/movies";

const HeroBanner = () => {
  return (
    <section className="relative w-full h-[85vh] min-h-[500px] overflow-hidden">
      <img
        src={heroMovie.image}
        alt={heroMovie.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-16 md:pb-24">
        <div className="max-w-2xl animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">
              Estreno
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="text-sm font-semibold text-accent">{heroMovie.rating}</span>
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-3 tracking-tight text-foreground">
            {heroMovie.title}
          </h2>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <span>{heroMovie.year}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>{heroMovie.genre}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>{heroMovie.duration}</span>
          </div>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
            {heroMovie.description}
          </p>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/30">
              <Play className="w-5 h-5 fill-current" />
              Reproducir
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold text-base hover:bg-secondary/80 transition-all hover:scale-105 active:scale-95 border border-border">
              <Plus className="w-5 h-5" />
              Mi Lista
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
