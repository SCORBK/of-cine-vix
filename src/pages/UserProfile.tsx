import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, Heart, Eye, UserPlus, UserCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MovieCard from "@/components/MovieCard";
import type { DbMovie } from "@/types/movie";

const UserProfile = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [favoriteMovies, setFavoriteMovies] = useState<DbMovie[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      setLoading(true);
      const [{ data: profileData }, { count: followers }, { count: following }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).single(),
        supabase.from("followers").select("*", { count: "exact", head: true }).eq("following_id", userId),
        supabase.from("followers").select("*", { count: "exact", head: true }).eq("follower_id", userId),
      ]);
      setProfile(profileData);
      setFollowerCount(followers || 0);
      setFollowingCount(following || 0);

      // Check if current user follows this profile
      if (user) {
        const { data: followData } = await supabase.from("followers").select("id").eq("follower_id", user.id).eq("following_id", userId);
        setIsFollowing((followData || []).length > 0);
      }

      // Fetch favorite movies
      const { data: lists } = await supabase.from("user_movie_lists").select("movie_id").eq("user_id", userId).eq("list_type", "favorite");
      if (lists && lists.length > 0) {
        const { data: movies } = await supabase.from("movies").select("*").in("id", lists.map(l => l.movie_id));
        setFavoriteMovies((movies as DbMovie[]) || []);
      }
      setLoading(false);
    };
    fetch();
  }, [userId, user]);

  const handleFollow = async () => {
    if (!user || !userId) return;
    if (isFollowing) {
      await supabase.from("followers").delete().eq("follower_id", user.id).eq("following_id", userId);
      setIsFollowing(false);
      setFollowerCount(prev => prev - 1);
    } else {
      await supabase.from("followers").insert({ follower_id: user.id, following_id: userId });
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
    }
  };

  const startChat = () => {
    navigate("/profile");
    // User will find or start chat from profile chats tab
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Cargando...</p></div>;
  }

  if (!profile) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Usuario no encontrado</p></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/8 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden mb-8"
        >
          <div className="h-36 sm:h-44 relative">
            {profile.cover_url ? (
              <img src={profile.cover_url} alt="Portada" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
          </div>

          <div className="px-6 sm:px-10 pb-6 -mt-14 sm:-mt-16 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-card bg-secondary flex items-center justify-center overflow-hidden shadow-2xl shadow-primary/10">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 text-center sm:text-left sm:pb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{profile.display_name || "Usuario"}</h1>
                <p className="text-muted-foreground text-sm mt-0.5">@{profile.username || "usuario"}</p>
                <div className="flex items-center gap-3 mt-1.5 justify-center sm:justify-start">
                  <span className="text-xs text-muted-foreground"><strong className="text-foreground">{followerCount}</strong> seguidores</span>
                  <span className="text-xs text-muted-foreground"><strong className="text-foreground">{followingCount}</strong> siguiendo</span>
                </div>
                {profile.bio && <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>}
              </div>

              {user && user.id !== userId && (
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant={isFollowing ? "secondary" : "default"} onClick={handleFollow} className="gap-2">
                    {isFollowing ? <><UserCheck className="w-4 h-4" /> Siguiendo</> : <><UserPlus className="w-4 h-4" /> Seguir</>}
                  </Button>
                  <Button size="sm" variant="outline" onClick={startChat} className="gap-2">
                    <MessageCircle className="w-4 h-4" /> Mensaje
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {favoriteMovies.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-destructive" /> Películas favoritas
            </h2>
            <div className="flex flex-wrap gap-4">
              {favoriteMovies.map((m, i) => (
                <MovieCard key={m.id} movie={m} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
