import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, X, Send, AlertTriangle, MonitorX, Subtitles, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { DbMovie } from "@/types/movie";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const reportReasons = [
  { key: "video", label: "Video no carga", icon: MonitorX },
  { key: "audio", label: "Problema de audio", icon: AlertTriangle },
  { key: "subtitles", label: "Subtítulos incorrectos", icon: Subtitles },
  { key: "bug", label: "Error / Bug", icon: Bug },
] as const;

interface ReportMovieModalProps {
  movie: DbMovie;
  open: boolean;
  onClose: () => void;
}

const ReportMovieModal = ({ movie, open, onClose }: ReportMovieModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user || !selectedReason) return;
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      movie_id: movie.id,
      category: selectedReason,
      message: description || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Reporte enviado", description: `Tu reporte sobre "${movie.title}" fue recibido.` });
    setSelectedReason(null);
    setDescription("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-destructive" />
                  <h3 className="font-semibold text-foreground">Reportar problema</h3>
                </div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="px-5 pt-4 pb-2 flex items-center gap-3">
                {movie.image_url && <img src={movie.image_url} alt={movie.title} className="w-10 h-14 rounded-lg object-cover" />}
                <div>
                  <p className="text-sm font-medium text-foreground">{movie.title}</p>
                  <p className="text-xs text-muted-foreground">{movie.year} · {movie.genre}</p>
                </div>
              </div>
              <div className="px-5 py-3">
                <p className="text-xs text-muted-foreground mb-2">¿Qué tipo de problema encontraste?</p>
                <div className="grid grid-cols-2 gap-2">
                  {reportReasons.map((r) => {
                    const Icon = r.icon;
                    const isSelected = selectedReason === r.key;
                    return (
                      <button key={r.key} onClick={() => setSelectedReason(r.key)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                        }`}>
                        <Icon className="w-4 h-4 shrink-0" />{r.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="px-5 pb-3">
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe el problema (opcional)..."
                  className="bg-secondary/40 border-border/50 text-sm resize-none h-20" maxLength={500} />
              </div>
              <div className="px-5 pb-5 flex gap-2">
                <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
                <Button onClick={handleSubmit} disabled={!selectedReason || !user} className="flex-1 gap-2">
                  <Send className="w-4 h-4" /> Enviar Reporte
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportMovieModal;
