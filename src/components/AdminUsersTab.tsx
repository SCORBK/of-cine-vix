import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Ban, ShieldCheck, User, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ManagedUser {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  reportCount: number;
}

const statusStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
  active: { label: "Activo", bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
  warned: { label: "Advertido", bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  blocked: { label: "Bloqueado", bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
};

const AdminUsersTab = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, username, avatar_url, created_at");

    if (profiles) {
      // Get report counts per user
      const { data: reports } = await supabase
        .from("reports")
        .select("reported_user_id");

      const reportCounts = new Map<string, number>();
      (reports || []).forEach((r: any) => {
        if (r.reported_user_id) {
          reportCounts.set(r.reported_user_id, (reportCounts.get(r.reported_user_id) || 0) + 1);
        }
      });

      setUsers(
        profiles.map((p: any) => ({
          ...p,
          reportCount: reportCounts.get(p.user_id) || 0,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = searchQuery.trim()
    ? users.filter((u) =>
        u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-accent/20 bg-accent/10 p-4 flex items-center gap-3"
        >
          <User className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xl font-bold text-accent">{users.length}</p>
            <p className="text-xs text-muted-foreground">Usuarios registrados</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="rounded-xl border border-primary/20 bg-primary/10 p-4 flex items-center gap-3"
        >
          <ShieldCheck className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xl font-bold text-primary">{users.filter(u => u.reportCount > 0).length}</p>
            <p className="text-xs text-muted-foreground">Con reportes</p>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar usuarios..." className="pl-10 bg-secondary/50 border-border/50" />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Cargando usuarios...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/60 p-8 text-center">
          <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden"
            >
              <div className="px-5 py-4 flex items-center gap-4">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.display_name || "U"}&background=random`}
                  alt={user.display_name || ""} className="w-10 h-10 rounded-full object-cover border-2 border-border"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{user.display_name || "Sin nombre"}</p>
                    <span className="text-xs text-muted-foreground">@{user.username || "desconocido"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Desde {new Date(user.created_at).toLocaleDateString("es-MX", { month: "short", year: "numeric" })} · {user.reportCount} reportes
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsersTab;
