import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Plus, Trash2, Pencil, Search, X, Save, Tv, ChevronDown, ChevronUp, Layers } from "lucide-react";
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
  content_type: string;
}

interface EpisodeForm {
  season_number: string;
  episode_number: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: string;
}

const emptyForm: MovieForm = { title: "", description: "", genre: "", year: "", rating: "", image_url: "", trailer_url: "", content_type: "movie" };
const emptyEpisodeForm: EpisodeForm = { season_number: "1", episode_number: "1", title: "", description: "", video_url: "", thumbnail_url: "", duration: "" };

const AdminMoviesTab = () => {
  const { toast } = useToast();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MovieForm>(emptyForm);

  // Episodes management
  const [managingEpisodesFor, setManagingEpisodesFor] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | null>(null);
  const [episodeForm, setEpisodeForm] = useState<EpisodeForm>(emptyEpisodeForm);

  const fetchMovies = async () => {
    setLoading(true);
    const { data } = await supabase.from("movies").select("*").order("created_at", { ascending: false });
    setMovies(data || []);
    setLoading(false);
  };

  const fetchEpisodes = async (movieId: string) => {
    const { data } = await supabase.from("episodes").select("*").eq("movie_id", movieId).order("season_number").order("episode_number");
    setEpisodes(data || []);
  };

  useEffect(() => { fetchMovies(); }, []);

  useEffect(() => {
    if (managingEpisodesFor) fetchEpisodes(managingEpisodesFor);
  }, [managingEpisodesFor]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Error", description: "El título es obligatorio", variant: "destructive" });
      return;
    }
    const payload: any = {
      title: form.title,
      description: form.description || null,
      genre: form.genre || null,
      year: form.year ? parseInt(form.year) : null,
      rating: form.rating ? parseFloat(form.rating) : null,
      image_url: form.image_url || null,
      trailer_url: form.trailer_url || null,
      content_type: form.content_type,
    };

    if (editingId) {
      const { error } = await supabase.from("movies").update(payload).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Actualizado" });
    } else {
      const { error } = await supabase.from("movies").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Agregado" });
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
      content_type: movie.content_type || "movie",
    });
    setEditingId(movie.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("movies").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Eliminado" });
    fetchMovies();
  };

  // Episode handlers
  const handleSaveEpisode = async () => {
    if (!episodeForm.title.trim() || !managingEpisodesFor) return;
    const payload = {
      movie_id: managingEpisodesFor,
      season_number: parseInt(episodeForm.season_number) || 1,
      episode_number: parseInt(episodeForm.episode_number) || 1,
      title: episodeForm.title,
      description: episodeForm.description || null,
      video_url: episodeForm.video_url || null,
      thumbnail_url: episodeForm.thumbnail_url || null,
      duration: episodeForm.duration || null,
    };

    if (editingEpisodeId) {
      const { error } = await supabase.from("episodes").update(payload).eq("id", editingEpisodeId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Episodio actualizado" });
    } else {
      const { error } = await supabase.from("episodes").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Episodio agregado" });
    }
    setEpisodeForm(emptyEpisodeForm);
    setShowEpisodeForm(false);
    setEditingEpisodeId(null);
    fetchEpisodes(managingEpisodesFor);
  };

  const handleDeleteEpisode = async (id: string) => {
    const { error } = await supabase.from("episodes").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Episodio eliminado" });
    if (managingEpisodesFor) fetchEpisodes(managingEpisodesFor);
  };

  const filtered = searchQuery.trim()
    ? movies.filter((m) => m.title?.toLowerCase().includes(searchQuery.toLowerCase()) || m.genre?.toLowerCase().includes(searchQuery.toLowerCase()))
    : movies;

  const managingMovie = movies.find(m => m.id === managingEpisodesFor);

  // Group episodes by season
  const groupedEpisodes = episodes.reduce((acc: Record<number, any[]>, ep: any) => {
    const s = ep.season_number || 1;
    if (!acc[s]) acc[s] = [];
    acc[s].push(ep);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Episodes management panel */}
      <AnimatePresence>
        {managingEpisodesFor && managingMovie && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-accent/30 bg-accent/5 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tv className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="text-base font-bold text-foreground">Episodios: {managingMovie.title}</h3>
                  <p className="text-xs text-muted-foreground">{episodes.length} episodios en total</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEpisodeForm(emptyEpisodeForm); setEditingEpisodeId(null); setShowEpisodeForm(true); }} className="gap-1">
                  <Plus className="w-3 h-3" /> Episodio
                </Button>
                <button onClick={() => { setManagingEpisodesFor(null); setShowEpisodeForm(false); }} className="p-1 rounded-lg hover:bg-secondary">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Episode form */}
            {showEpisodeForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-border/50 bg-card/60 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground">{editingEpisodeId ? "Editar Episodio" : "Nuevo Episodio"}</h4>
                <div className="grid grid-cols-3 gap-3">
                  <Input value={episodeForm.season_number} onChange={(e) => setEpisodeForm({ ...episodeForm, season_number: e.target.value })} placeholder="Temporada" type="number" className="bg-secondary/50 border-border/50" />
                  <Input value={episodeForm.episode_number} onChange={(e) => setEpisodeForm({ ...episodeForm, episode_number: e.target.value })} placeholder="Episodio #" type="number" className="bg-secondary/50 border-border/50" />
                  <Input value={episodeForm.duration} onChange={(e) => setEpisodeForm({ ...episodeForm, duration: e.target.value })} placeholder="Duración (ej: 45min)" className="bg-secondary/50 border-border/50" />
                </div>
                <Input value={episodeForm.title} onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })} placeholder="Título del episodio *" className="bg-secondary/50 border-border/50" />
                <Input value={episodeForm.video_url} onChange={(e) => setEpisodeForm({ ...episodeForm, video_url: e.target.value })} placeholder="URL del video" className="bg-secondary/50 border-border/50" />
                <Input value={episodeForm.thumbnail_url} onChange={(e) => setEpisodeForm({ ...episodeForm, thumbnail_url: e.target.value })} placeholder="URL de miniatura" className="bg-secondary/50 border-border/50" />
                <Textarea value={episodeForm.description} onChange={(e) => setEpisodeForm({ ...episodeForm, description: e.target.value })} placeholder="Descripción" className="bg-secondary/50 border-border/50 resize-none h-16" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEpisode} className="gap-1"><Save className="w-3 h-3" /> Guardar</Button>
                  <Button size="sm" variant="outline" onClick={() => { setShowEpisodeForm(false); setEditingEpisodeId(null); }}>Cancelar</Button>
                </div>
              </motion.div>
            )}

            {/* Episodes grouped by season */}
            {Object.keys(groupedEpisodes).sort((a, b) => Number(a) - Number(b)).map(season => (
              <div key={season}>
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Temporada {season}</span>
                  <span className="text-xs text-muted-foreground">({groupedEpisodes[Number(season)].length} eps)</span>
                </div>
                <div className="space-y-1">
                  {groupedEpisodes[Number(season)].map((ep: any) => (
                    <div key={ep.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/20 bg-card/40 hover:bg-card/80 transition-colors">
                      {ep.thumbnail_url ? (
                        <img src={ep.thumbnail_url} alt={ep.title} className="w-16 h-10 rounded object-cover shrink-0" />
                      ) : (
                        <div className="w-16 h-10 rounded bg-secondary flex items-center justify-center shrink-0">
                          <Film className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">E{ep.episode_number} · {ep.title}</p>
                        <p className="text-xs text-muted-foreground">{ep.duration || "—"}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => {
                          setEpisodeForm({
                            season_number: ep.season_number?.toString() || "1",
                            episode_number: ep.episode_number?.toString() || "1",
                            title: ep.title || "",
                            description: ep.description || "",
                            video_url: ep.video_url || "",
                            thumbnail_url: ep.thumbnail_url || "",
                            duration: ep.duration || "",
                          });
                          setEditingEpisodeId(ep.id);
                          setShowEpisodeForm(true);
                        }} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDeleteEpisode(ep.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {episodes.length === 0 && !showEpisodeForm && (
              <p className="text-sm text-muted-foreground text-center py-4">Sin episodios. Agrega el primero.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/20 bg-primary/10 p-4 flex items-center gap-3"
      >
        <Film className="w-5 h-5 text-primary" />
        <div>
          <p className="text-xl font-bold text-primary">{movies.length}</p>
          <p className="text-xs text-muted-foreground">Películas y series en el catálogo</p>
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
            <h3 className="text-base font-semibold text-foreground">{editingId ? "Editar" : "Nuevo Contenido"}</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>

          {/* Content type selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setForm({ ...form, content_type: "movie" })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                form.content_type === "movie"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Film className="w-4 h-4" /> Película
            </button>
            <button
              onClick={() => setForm({ ...form, content_type: "series" })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                form.content_type === "series"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Tv className="w-4 h-4" /> Serie
            </button>
          </div>

          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título *" className="bg-secondary/50 border-border/50" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} placeholder="Género" className="bg-secondary/50 border-border/50" />
            <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="Año" type="number" className="bg-secondary/50 border-border/50" />
            <Input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} placeholder="Rating (0-10)" type="number" step="0.1" className="bg-secondary/50 border-border/50" />
          </div>
          <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="URL de imagen" className="bg-secondary/50 border-border/50" />
          <Input value={form.trailer_url} onChange={(e) => setForm({ ...form, trailer_url: e.target.value })} placeholder={form.content_type === "series" ? "URL de trailer general" : "URL del video/trailer"} className="bg-secondary/50 border-border/50" />
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción" className="bg-secondary/50 border-border/50 resize-none h-20" />
          <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> {editingId ? "Actualizar" : "Guardar"}</Button>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar películas y series..." className="pl-10 bg-secondary/50 border-border/50" />
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/60 p-8 text-center">
          <Film className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay contenido</p>
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
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{movie.title}</p>
                  {movie.content_type === "series" && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent/20 text-accent border border-accent/30">SERIE</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{movie.genre || "Sin género"} · {movie.year || "—"} · ⭐ {movie.rating || "—"}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {movie.content_type === "series" && (
                  <button onClick={() => setManagingEpisodesFor(managingEpisodesFor === movie.id ? null : movie.id)}
                    className={`p-2 rounded-lg transition-colors ${managingEpisodesFor === movie.id ? "bg-accent/20 text-accent" : "hover:bg-secondary text-muted-foreground hover:text-foreground"}`}>
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                )}
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
