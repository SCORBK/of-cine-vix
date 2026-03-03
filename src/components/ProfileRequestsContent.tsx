import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Check, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ProfileRequestsContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [followers, setFollowers] = useState<any[]>([]);
  const [myFollowing, setMyFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    fetchFollowers();
  }, [user]);

  const fetchFollowers = async () => {
    if (!user) return;
    // People who follow me
    const { data: follows } = await supabase.from("followers").select("id, follower_id, created_at").eq("following_id", user.id).order("created_at", { ascending: false });
    if (!follows || follows.length === 0) { setFollowers([]); return; }

    const ids = follows.map(f => f.follower_id);
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username, avatar_url").in("user_id", ids);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    // Check which ones I follow back
    const { data: myFollows } = await supabase.from("followers").select("following_id").eq("follower_id", user.id);
    setMyFollowing(new Set((myFollows || []).map(f => f.following_id)));

    setFollowers(follows.map(f => ({ ...f, profile: profileMap.get(f.follower_id) })));
  };

  const followBack = async (targetId: string) => {
    if (!user) return;
    await supabase.from("followers").insert({ follower_id: user.id, following_id: targetId });
    setMyFollowing(prev => new Set(prev).add(targetId));
  };

  const removeFollower = async (followId: string) => {
    await supabase.from("followers").delete().eq("id", followId);
    setFollowers(prev => prev.filter(f => f.id !== followId));
  };

  if (followers.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-secondary/80 flex items-center justify-center mx-auto mb-3">
          <UserPlus className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium">Sin seguidores aún</p>
        <p className="text-xs text-muted-foreground mt-1">Aquí aparecerán las personas que te siguen</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {followers.map((f, i) => {
        const isFollowingBack = myFollowing.has(f.follower_id);
        return (
          <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-card/60 backdrop-blur-sm"
          >
            {f.profile?.avatar_url ? (
              <img src={f.profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-border cursor-pointer" onClick={() => navigate(`/user/${f.follower_id}`)} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border-2 border-border cursor-pointer" onClick={() => navigate(`/user/${f.follower_id}`)}>
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-semibold cursor-pointer hover:underline" onClick={() => navigate(`/user/${f.follower_id}`)}>{f.profile?.display_name || "Usuario"}</span>{" "}
                <span className="text-muted-foreground">comenzó a seguirte</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(f.created_at).toLocaleDateString("es-MX")}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              {!isFollowingBack && (
                <Button size="sm" className="h-7 px-2.5 text-xs gap-1" onClick={() => followBack(f.follower_id)}>
                  <Check className="w-3 h-3" /> Seguir
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => removeFollower(f.id)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProfileRequestsContent;
