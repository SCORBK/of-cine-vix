import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Trash2, UserPlus, UserMinus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminFollowersTab = () => {
  const { toast } = useToast();
  const [followers, setFollowers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFollowers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("followers")
      .select("id, follower_id, following_id, created_at");
    
    if (data && data.length > 0) {
      const userIds = [...new Set(data.flatMap((f: any) => [f.follower_id, f.following_id]))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url")
        .in("user_id", userIds);
      
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      setFollowers(data.map((f: any) => ({
        ...f,
        follower: profileMap.get(f.follower_id),
        following: profileMap.get(f.following_id),
      })));
    } else {
      setFollowers([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchFollowers(); }, []);

  const removeFollower = async (id: string) => {
    await supabase.from("followers").delete().eq("id", id);
    toast({ title: "Relación eliminada" });
    fetchFollowers();
  };

  const filtered = searchQuery.trim()
    ? followers.filter((f) =>
        f.follower?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.following?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.follower?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.following?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : followers;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{followers.length}</p>
          <p className="text-sm text-muted-foreground">Relaciones de seguimiento totales</p>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre o usuario..."
          className="pl-10 bg-secondary/50 border-border/50"
        />
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/60 p-8 text-center">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay relaciones de seguimiento</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/30 bg-card/60"
            >
              {/* Follower */}
              <img
                src={f.follower?.avatar_url || `https://ui-avatars.com/api/?name=${f.follower?.display_name || "U"}&background=random`}
                alt="" className="w-8 h-8 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{f.follower?.display_name || "Usuario"}</p>
                <p className="text-[10px] text-muted-foreground">@{f.follower?.username}</p>
              </div>

              <UserPlus className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground">sigue a</span>

              {/* Following */}
              <img
                src={f.following?.avatar_url || `https://ui-avatars.com/api/?name=${f.following?.display_name || "U"}&background=random`}
                alt="" className="w-8 h-8 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{f.following?.display_name || "Usuario"}</p>
                <p className="text-[10px] text-muted-foreground">@{f.following?.username}</p>
              </div>

              <button
                onClick={() => removeFollower(f.id)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFollowersTab;
