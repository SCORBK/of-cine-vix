import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Film, Users,
  LayoutDashboard, Flag, Palette, MessageCircle, Shield, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminReportsTab from "@/components/AdminReportsTab";
import AdminCustomizeTab from "@/components/AdminCustomizeTab";
import AdminChatsTab from "@/components/AdminChatsTab";
import AdminUsersTab from "@/components/AdminUsersTab";
import AdminRolesTab from "@/components/AdminRolesTab";
import AdminFollowersTab from "@/components/AdminFollowersTab";
import AdminMoviesTab from "@/components/AdminMoviesTab";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type AdminTab = "dashboard" | "reports" | "chats" | "users" | "roles" | "followers" | "customize" | "movies";

const adminTabs: { key: AdminTab; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "movies", label: "Películas", icon: Film },
  { key: "reports", label: "Reportes", icon: Flag },
  { key: "chats", label: "Chats", icon: MessageCircle },
  { key: "users", label: "Usuarios", icon: Users },
  { key: "roles", label: "Roles", icon: Shield },
  { key: "followers", label: "Seguidores", icon: UserCheck },
  { key: "customize", label: "Personalización", icon: Palette },
];

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, hasRole, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [stats, setStats] = useState({ users: 0, reports: 0, movies: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: usersCount }, { count: reportsCount }, { count: moviesCount }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }),
        supabase.from("movies").select("*", { count: "exact", head: true }),
      ]);
      setStats({ users: usersCount || 0, reports: reportsCount || 0, movies: moviesCount || 0 });
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Cargando...</p></div>;
  }

  if (!isAdmin && !hasRole("support") && !hasRole("moderator")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-semibold">Acceso denegado</p>
          <p className="text-sm text-muted-foreground mt-1">No tienes permisos para acceder al panel de administración</p>
          <Button variant="outline" onClick={() => navigate("/")} className="mt-4">Volver al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/6 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground gap-2">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
              <p className="text-sm text-muted-foreground">Gestiona contenido y usuarios</p>
            </div>
          </div>
        </motion.div>

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
                <span className="relative z-10 flex items-center gap-2"><Icon className="w-4 h-4" /> {tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <StatCard index={0} icon={Users} label="Usuarios" value={String(stats.users)} color="primary" />
              <StatCard index={1} icon={Flag} label="Reportes" value={String(stats.reports)} color="accent" />
              <StatCard index={2} icon={Film} label="Películas" value={String(stats.movies)} color="primary" />
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

          {activeTab === "roles" && (
            <motion.div key="roles" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AdminRolesTab />
            </motion.div>
          )}

          {activeTab === "followers" && (
            <motion.div key="followers" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AdminFollowersTab />
            </motion.div>
          )}

          {activeTab === "movies" && (
            <motion.div key="movies" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AdminMoviesTab />
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
