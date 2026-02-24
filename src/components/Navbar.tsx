import { Search, User, Flame } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SearchOverlay from "@/components/SearchOverlay";

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-md shadow-lg" : "bg-gradient-to-b from-background/80 to-transparent"
        }`}
      >
        <div className="flex items-center gap-8">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-primary">Vel</span>
            <span className="text-foreground">ora</span>
          </h1>
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "Inicio", path: "/" },
              { label: "Películas", path: "/" },
              { label: "Series", path: "/" },
              { label: "Mi Lista", path: "/my-list" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/feed")}
            className="p-2 rounded-full hover:bg-secondary transition-colors relative group"
            title="Recomendaciones"
          >
            <Flame className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
          </button>
          <button onClick={() => setSearchOpen(true)} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={() => navigate("/profile")} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
