import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Film, Plus, Trash2, Pencil, Search, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MovieForm {
  title: string;
  description: string;
  genre: string;
  year: string;
  rating: string;
  image_url: string;
  trailer_url: string;
}

const emptyForm: MovieForm = { title: "", description: "", genre: "", year: "", rating: "", image_url: "", trailer_url: "" };

const AdminMoviesTab = () => {
  const { toast } = useToast();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MovieForm>(emptyForm);

  const fetchMovies = async () => {
    setLoading(true);
    const { data } = await supabase.from("movies").select("*").order("created_at", { ascending: false });
    setMovies(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMovies(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Error", description: "El título es obligatorio", variant: "destructive" });
      return;
    }
    const payload = {
      title: form.title,
      description: form.description || null,
      genre: form.genre || null,
      year: form.year ? parseInt(form.year) : null,
      rating: form.rating ? parseFloat(form.rating) : null,
      image_url: form.image_url || null,
      trailer_url: form.trailer_url || null,
    };

    if (editingId) {
      const { error } = await supabase.from("movies").update(payload).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Película actualizada" });
    } else {
      const { error } = await supabase.from("movies").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Película agregada" });
    }
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    fetchMovies();
  };

  const handleEdit = (movie: any) => {
    setForm({
      title: movie.title || "",
      description: movie.description || "",
      genre: movie.genre || "",
      year: movie.year?.toString() || "",
      rating: movie.rating?.toString() || "",
      image_url: movie.image_url || "",
      trailer_url: movie.trailer_url || "",
    });
    setEditingId(movie.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("movies").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Película eliminada" });
    fetchMovies();
  };

  const filtered = searchQuery.trim()
    ? movies.filter((m) => m.title?.toLowerCase().includes(searchQuery.toLowerCase()) || m.genre?.toLowerCase().includes(searchQuery.toLowerCase()))
    : movies;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/20 bg-primary/10 p-4 flex items-center gap-3"
      >
        <Film className="w-5 h-5 text-primary" />
        <div>
          <p className="text-xl font-bold text-primary">{movies.length}</p>
          <p className="text-xs text-muted-foreground">Películas en el catálogo</p>
        </div>
        <div className="ml-auto">
          <Button size="sm" onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Agregar
          </Button>
        </div>
      </motion.div>

      {/* Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 space-y-3"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-foreground">{editingId ? "Editar Película" : "Nueva Película"}</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título *" className="bg-secondary/50 border-border/50" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} placeholder="Género" className="bg-secondary/50 border-border/50" />
            <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="Año" type="number" className="bg-secondary/50 border-border/50" />
            <Input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} placeholder="Rating (0-10)" type="number" step="0.1" className="bg-secondary/50 border-border/50" />
          </div>
          <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="URL de imagen" className="bg-secondary/50 border-border/50" />
          <Input value={form.trailer_url} onChange={(e) => setForm({ ...form, trailer_url: e.target.value })} placeholder="URL del trailer" className="bg-secondary/50 border-border/50" />
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción" className="bg-secondary/50 border-border/50 resize-none h-20" />
          <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> {editingId ? "Actualizar" : "Guardar"}</Button>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar películas..." className="pl-10 bg-secondary/50 border-border/50" />
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/60 p-8 text-center">
          <Film className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay películas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((movie, i) => (
            <motion.div key={movie.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/30 bg-card/60"
            >
              {movie.image_url ? (
                <img src={movie.image_url} alt={movie.title} className="w-12 h-16 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-12 h-16 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Film className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{movie.title}</p>
                <p className="text-xs text-muted-foreground">{movie.genre || "Sin género"} · {movie.year || "—"} · ⭐ {movie.rating || "—"}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleEdit(movie)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(movie.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMoviesTab;
