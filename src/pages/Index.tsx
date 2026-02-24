import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import SupportChat from "@/components/SupportChat";
import { categories } from "@/data/movies";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner />
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
