import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Image, Film, Upload, Plus, Trash2, Users,
  LayoutDashboard, ImagePlus, Flag, Palette, MessageCircle, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminReportsTab from "@/components/AdminReportsTab";
import AdminCustomizeTab from "@/components/AdminCustomizeTab";
import AdminChatsTab from "@/components/AdminChatsTab";
import AdminUsersTab from "@/components/AdminUsersTab";

type AdminTab = "dashboard" | "avatars" | "covers" | "movies" | "reports" | "customize" | "chats" | "users";

const adminTabs: { key: AdminTab; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "reports", label: "Reportes", icon: Flag },
  { key: "chats", label: "Chats", icon: MessageCircle },
  { key: "users", label: "Usuarios", icon: Shield },
  { key: "customize", label: "Personalización", icon: Palette },
  { key: "avatars", label: "Fotos de Perfil", icon: Users },
  { key: "covers", label: "Portadas", icon: Image },
  { key: "movies", label: "Películas", icon: Film },
];

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

// Mock data
const mockAvatars = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop",
];

const mockCovers = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=300&fit=crop",
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=300&fit=crop",
];

const mockMovies = [
  { id: 1, title: "Película de Acción", genre: "Acción", year: 2024 },
  { id: 2, title: "Comedia Romántica", genre: "Comedia", year: 2024 },
  { id: 3, title: "Terror Nocturno", genre: "Terror", year: 2023 },
];

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/6 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
              <p className="text-sm text-muted-foreground">Gestiona contenido y usuarios</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1"
        >
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {isActive && (
                  <motion.div layoutId="adminTab" className="absolute inset-0 rounded-xl bg-primary shadow-lg shadow-primary/25"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" /> {tab.label}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <StatCard index={0} icon={Users} label="Fotos de Perfil" value={mockAvatars.length.toString()} color="primary" />
              <StatCard index={1} icon={Image} label="Portadas" value={mockCovers.length.toString()} color="accent" />
              <StatCard index={2} icon={Film} label="Películas" value={mockMovies.length.toString()} color="primary" />
            </motion.div>
          )}

          {activeTab === "avatars" && (
            <motion.div key="avatars" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Fotos de Perfil Disponibles</h2>
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4" /> Subir Foto
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mockAvatars.map((url, i) => (
                  <motion.div key={i} custom={i} variants={fadeIn} initial="hidden" animate="visible"
                    className="group relative aspect-square rounded-xl overflow-hidden border border-border/50 bg-card/60"
                  >
                    <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                <motion.button custom={mockAvatars.length} variants={fadeIn} initial="hidden" animate="visible"
                  className="aspect-square rounded-xl border-2 border-dashed border-border/50 bg-card/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                >
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-xs">Agregar</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === "covers" && (
            <motion.div key="covers" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Portadas Disponibles</h2>
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4" /> Subir Portada
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockCovers.map((url, i) => (
                  <motion.div key={i} custom={i} variants={fadeIn} initial="hidden" animate="visible"
                    className="group relative h-40 rounded-xl overflow-hidden border border-border/50 bg-card/60"
                  >
                    <img src={url} alt={`Cover ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                <motion.button custom={mockCovers.length} variants={fadeIn} initial="hidden" animate="visible"
                  className="h-40 rounded-xl border-2 border-dashed border-border/50 bg-card/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                >
                  <Upload className="w-8 h-8" />
                  <span className="text-sm">Subir nueva portada</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === "movies" && (
            <motion.div key="movies" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Películas</h2>
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4" /> Agregar Película
                </Button>
              </div>
              <div className="space-y-3">
                {mockMovies.map((movie, i) => (
                  <motion.div key={movie.id} custom={i} variants={fadeIn} initial="hidden" animate="visible"
                    className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm px-5 py-4 hover:border-primary/30 transition-all"
                  >
                    <div className="w-12 h-16 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Film className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{movie.title}</p>
                      <p className="text-xs text-muted-foreground">{movie.genre} · {movie.year}</p>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "reports" && (
            <motion.div key="reports" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AdminReportsTab />
            </motion.div>
          )}

          {activeTab === "customize" && (
            <motion.div key="customize" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AdminCustomizeTab />
            </motion.div>
          )}

          {activeTab === "chats" && (
            <motion.div key="chats" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AdminChatsTab />
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AdminUsersTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function StatCard({ index, icon: Icon, label, value, color }: { index: number; icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <motion.div custom={index} variants={fadeIn} initial="hidden" animate="visible"
      className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-6"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color === "primary" ? "bg-primary/10" : "bg-accent/10"}`}>
        <Icon className={`w-6 h-6 ${color === "primary" ? "text-primary" : "text-accent"}`} />
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

export default Admin;
