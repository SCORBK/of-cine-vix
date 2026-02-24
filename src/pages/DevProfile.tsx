import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, Star, Film, Users, Clock, CheckCircle2,
  MessageCircle, Globe, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const devPosts = [
  {
    id: 1,
    title: "🎬 ¡Velora 2.0 ya está aquí!",
    content: "Hemos rediseñado toda la experiencia. Nuevas categorías, mejor rendimiento y un sistema de recomendaciones personalizado.",
    date: "Hace 2 días",
    likes: 1243,
    comments: 89,
  },
  {
    id: 2,
    title: "🏆 Sistema de Rachas y Puntos Pro",
    content: "¡Gana puntos cada día que uses Velora! Desbloquea insignias exclusivas y funciones premium con tu actividad.",
    date: "Hace 5 días",
    likes: 892,
    comments: 156,
  },
  {
    id: 3,
    title: "🔧 Mantenimiento programado",
    content: "Este sábado realizaremos mejoras en nuestros servidores. El servicio podría interrumpirse brevemente de 3:00 a 5:00 AM.",
    date: "Hace 1 semana",
    likes: 345,
    comments: 42,
  },
];

const DevProfile = () => {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLikedPosts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full bg-accent/6 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>
        </motion.div>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden mb-8"
        >
          {/* Cover */}
          <div className="h-36 sm:h-44 relative bg-gradient-to-br from-primary/40 via-accent/30 to-primary/20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
          </div>

          <div className="px-6 sm:px-10 pb-6 -mt-14 sm:-mt-16 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              {/* Logo/Avatar */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-card bg-primary flex items-center justify-center shadow-2xl shadow-primary/20">
                <span className="text-3xl sm:text-4xl font-extrabold text-primary-foreground tracking-tight">V</span>
              </div>

              <div className="flex-1 text-center sm:text-left sm:pb-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Velora</h1>
                  <CheckCircle2 className="w-5 h-5 text-primary fill-primary/20" />
                </div>
                <p className="text-muted-foreground text-sm mt-0.5">@velora_official</p>
                <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start flex-wrap">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Shield className="w-3 h-3" /> Cuenta Oficial
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Globe className="w-3 h-3" /> Desarrollador
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 text-center">
              {[
                { icon: Film, label: "Películas", value: "2,500+" },
                { icon: Users, label: "Usuarios", value: "150K" },
                { icon: Clock, label: "Desde", value: "2024" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-xl bg-secondary/30 border border-border/30 p-3">
                    <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Info notice */}
            <div className="mt-4 rounded-lg bg-primary/5 border border-primary/10 p-3 flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Esta es la cuenta oficial de Velora. No puedes enviar solicitudes de amistad ni mensajes directos.
                Si necesitas ayuda, usa el <span className="text-primary font-medium">chat de soporte</span>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Posts/Publications */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Publicaciones</h2>
          </div>

          <div className="space-y-4">
            {devPosts.map((post, i) => {
              const liked = likedPosts.includes(post.id);
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">V</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-foreground">Velora</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary fill-primary/20" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{post.date}</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{post.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{post.content}</p>
                  <Separator className="my-3 bg-border/30" />
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? "text-destructive" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <Star className={`w-3.5 h-3.5 ${liked ? "fill-destructive" : ""}`} />
                      {post.likes + (liked ? 1 : 0)}
                    </button>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DevProfile;
