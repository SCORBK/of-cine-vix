import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Trash2, UserPlus, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminFollowersTab = () => {
  const { toast } = useToast();
  const [followers, setFollowers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"followers" | "users">("followers");

  const fetchFollowers = async () => {
    setLoading(true);
    const { data } = await supabase.from("followers").select("id, follower_id, following_id, created_at");
    if (data && data.length > 0) {
      const userIds = [...new Set(data.flatMap((f: any) => [f.follower_id, f.following_id]))];
      const { data: profs } = await supabase.from("profiles").select("user_id, display_name, username, avatar_url, verified").in("user_id", userIds);
      const profileMap = new Map((profs || []).map((p: any) => [p.user_id, p]));
      setFollowers(data.map((f: any) => ({ ...f, follower: profileMap.get(f.follower_id), following: profileMap.get(f.following_id) })));
    } else {
      setFollowers([]);
    }
    setLoading(false);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from("profiles").select("user_id, display_name, username, avatar_url, verified");
    setProfiles(data || []);
  };

  useEffect(() => { fetchFollowers(); fetchProfiles(); }, []);

  const removeFollower = async (id: string) => {
    await supabase.from("followers").delete().eq("id", id);
    toast({ title: "Relación eliminada" });
    fetchFollowers();
  };

  const toggleVerified = async (userId: string, current: boolean) => {
    await supabase.from("profiles").update({ verified: !current } as any).eq("user_id", userId);
    toast({ title: !current ? "Usuario verificado ✓" : "Verificación removida" });
    fetchProfiles();
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

  const filteredProfiles = searchQuery.trim()
    ? profiles.filter(p => p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.username?.toLowerCase().includes(searchQuery.toLowerCase()))
    : profiles;

  return (
    <div className="space-y-6">
      {/* View toggle */}
      <div className="flex gap-2">
        <button onClick={() => setView("followers")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === "followers" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}
        >Relaciones ({followers.length})</button>
        <button onClick={() => setView("users")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === "users" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}
        >Verificación ({profiles.filter(p => p.verified).length})</button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar..." className="pl-10 bg-secondary/50 border-border/50" />
      </div>

      {view === "followers" ? (
        <>
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
                <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/30 bg-card/60"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={f.follower?.avatar_url || `https://ui-avatars.com/api/?name=${f.follower?.display_name || "U"}&background=random`}
                      alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate flex items-center gap-1">
                        {f.follower?.display_name || "Usuario"}
                        {f.follower?.verified && <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />}
                      </p>
                      <p className="text-[10px] text-muted-foreground">@{f.follower?.username}</p>
                    </div>
                  </div>

                  <UserPlus className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs text-muted-foreground shrink-0">sigue a</span>

                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <img src={f.following?.avatar_url || `https://ui-avatars.com/api/?name=${f.following?.display_name || "U"}&background=random`}
                      alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate flex items-center gap-1">
                        {f.following?.display_name || "Usuario"}
                        {f.following?.verified && <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />}
                      </p>
                      <p className="text-[10px] text-muted-foreground">@{f.following?.username}</p>
                    </div>
                  </div>

                  <button onClick={() => removeFollower(f.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          {filteredProfiles.map((p, i) => (
            <motion.div key={p.user_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/30 bg-card/60"
            >
              <img src={p.avatar_url || `https://ui-avatars.com/api/?name=${p.display_name || "U"}&background=random`}
                alt="" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate flex items-center gap-1">
                  {p.display_name || "Usuario"}
                  {p.verified && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                </p>
                <p className="text-xs text-muted-foreground">@{p.username}</p>
              </div>
              <Button size="sm" variant={p.verified ? "secondary" : "default"} onClick={() => toggleVerified(p.user_id, p.verified)}
                className="text-xs gap-1 shrink-0"
              >
                <CheckCircle2 className="w-3 h-3" />
                {p.verified ? "Quitar ✓" : "Verificar"}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFollowersTab;
