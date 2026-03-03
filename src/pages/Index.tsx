import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import SupportChat from "@/components/SupportChat";
import { useMovies } from "@/hooks/useMovies";

const Index = () => {
  const { heroMovie, categories, loading } = useMovies();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {heroMovie ? <HeroBanner movie={heroMovie} /> : (
        <div className="h-[85vh] min-h-[500px] flex items-center justify-center">
          <p className="text-muted-foreground">{loading ? "Cargando..." : "Agrega películas desde el panel admin"}</p>
        </div>
      )}
      <div className="-mt-16 relative z-10 pt-4">
        {categories.map((cat) => (
          <MovieRow key={cat.name} title={cat.name} movies={cat.movies} />
        ))}
      </div>
      <footer className="px-6 md:px-12 py-10 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold">
            <span className="text-primary">Vel</span>
            <span className="text-foreground">ora</span>
          </h2>
          <p className="text-xs text-muted-foreground">© 2025 Velora. Todos los derechos reservados.</p>
        </div>
      </footer>
      <SupportChat />
    </div>
  );
};

export default Index;
