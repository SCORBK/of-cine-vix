import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, UserPlus, UserCheck, User, MessageCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UserSearchModalProps {
  open: boolean;
  onClose: () => void;
}

const UserSearchModal = ({ open, onClose }: UserSearchModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setUsers([]);
    fetchFollowing();
  }, [open]);

  const fetchFollowing = async () => {
    if (!user) return;
    const { data } = await supabase.from("followers").select("following_id").eq("follower_id", user.id);
    setFollowing(new Set((data || []).map(d => d.following_id)));
  };

  useEffect(() => {
    if (!query.trim()) { setUsers([]); return; }
    const timer = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name, username, avatar_url, verified")
        .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(10);
      setUsers((data || []).filter(u => u.user_id !== user?.id));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, user]);

  const handleFollow = async (targetId: string) => {
    if (!user) return;
    if (following.has(targetId)) {
      await supabase.from("followers").delete().eq("follower_id", user.id).eq("following_id", targetId);
      setFollowing(prev => { const n = new Set(prev); n.delete(targetId); return n; });
    } else {
      await supabase.from("followers").insert({ follower_id: user.id, following_id: targetId });
      setFollowing(prev => new Set(prev).add(targetId));
    }
  };

  const startChat = async (targetId: string) => {
    if (!user) return;
    // Send initial greeting to start chat thread
    await supabase.from("chat_messages").insert({
      sender_id: user.id,
      receiver_id: targetId,
      message: "👋 ¡Hola!",
    });
    onClose();
    navigate("/profile");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-start justify-center pt-20 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div initial={{ scale: 0.95, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar usuarios..." className="pl-10 bg-secondary/50 border-border/50" autoFocus />
                </div>
                <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {query.trim() && users.length === 0 && (
                <div className="py-8 text-center">
                  <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
                </div>
              )}
              {users.map((u, i) => {
                const isFollowing = following.has(u.user_id);
                return (
                  <motion.div key={u.user_id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/40 transition-colors cursor-pointer"
                    onClick={() => { navigate(`/user/${u.user_id}`); onClose(); }}
                  >
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border-2 border-border"><User className="w-5 h-5 text-muted-foreground" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1">
                        {u.display_name || "Usuario"}
                        {u.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </p>
                      <p className="text-xs text-muted-foreground">@{u.username || "usuario"}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="shrink-0 h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); startChat(u.user_id); }}
                      title="Enviar mensaje"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant={isFollowing ? "secondary" : "default"} className="text-xs gap-1 shrink-0"
                      onClick={(e) => { e.stopPropagation(); handleFollow(u.user_id); }}
                    >
                      {isFollowing ? <><UserCheck className="w-3 h-3" /> Siguiendo</> : <><UserPlus className="w-3 h-3" /> Seguir</>}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserSearchModal;
