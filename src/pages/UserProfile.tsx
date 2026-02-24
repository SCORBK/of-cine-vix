import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, User, Heart, Eye, UserPlus, UserCheck, Clock,
  Flame, Trophy, Star, Zap, Crown, Award, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import movieData, { heroMovie } from "@/data/movies";
import MovieCard from "@/components/MovieCard";

const mockUsers: Record<string, {
  name: string; username: string; avatar: string; cover: string;
  favorites: string[]; watched: string[]; streak: number; points: number; level: number;
  badges: { icon: React.ElementType; label: string; color: string; unlocked: boolean }[];
}> = {
  "user-1": {
    name: "Ana García", username: "@anagarcia", 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=400&fit=crop",
    favorites: ["1", "3", "5"], watched: ["1", "2", "3", "4"], streak: 12, points: 1450, level: 3,
    badges: [
      { icon: Flame, label: "Racha 7 días", color: "text-orange-400", unlocked: true },
      { icon: Star, label: "Cinéfilo", color: "text-yellow-400", unlocked: true },
      { icon: Trophy, label: "Top Fan", color: "text-primary", unlocked: true },
      { icon: Crown, label: "Elite", color: "text-amber-500", unlocked: false },
      { icon: Zap, label: "Veloz", color: "text-blue-400", unlocked: false },
      { icon: Award, label: "Leyenda", color: "text-purple-400", unlocked: false },
    ],
  },
  "user-2": {
    name: "Diego López", username: "@diegolopez",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=400&fit=crop",
    favorites: ["2", "4"], watched: ["1", "2"], streak: 5, points: 620, level: 2,
    badges: [
      { icon: Flame, label: "Racha 7 días", color: "text-orange-400", unlocked: false },
      { icon: Star, label: "Cinéfilo", color: "text-yellow-400", unlocked: true },
      { icon: Trophy, label: "Top Fan", color: "text-primary", unlocked: false },
      { icon: Crown, label: "Elite", color: "text-amber-500", unlocked: false },
      { icon: Zap, label: "Veloz", color: "text-blue-400", unlocked: true },
      { icon: Award, label: "Leyenda", color: "text-purple-400", unlocked: false },
    ],
  },
};

const allMovies = [heroMovie, ...movieData];

const levelNames = ["Novato", "Aficionado", "Cinéfilo", "Experto", "Maestro", "Leyenda"];
const pointsPerLevel = 500;

const proFeatures = [
  { label: "Temas exclusivos", points: 500, icon: Star },
  { label: "Avatar animado", points: 1000, icon: Zap },
  { label: "Badge personalizado", points: 2000, icon: Award },
  { label: "Perfil destacado", points: 3000, icon: Crown },
];

const UserProfile = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "friends">("none");

  const user = mockUsers[userId || ""] || mockUsers["user-1"];
  const userFavMovies = allMovies.filter((m) => user.favorites.includes(String(m.id)));
  const levelProgress = (user.points % pointsPerLevel) / pointsPerLevel * 100;

  const handleFriendRequest = () => {
    if (friendStatus === "none") setFriendStatus("pending");
    else if (friendStatus === "pending") setFriendStatus("none");
  };

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

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden mb-8"
        >
          <div className="h-36 sm:h-44 relative">
            <img src={user.cover} alt="Portada" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
          </div>

          <div className="px-6 sm:px-10 pb-6 -mt-14 sm:-mt-16 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-card bg-secondary flex items-center justify-center overflow-hidden shadow-2xl shadow-primary/10">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 text-center sm:text-left sm:pb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{user.name}</h1>
                <p className="text-muted-foreground text-sm mt-0.5">{user.username}</p>
                <div className="flex items-center gap-3 mt-1.5 justify-center sm:justify-start flex-wrap">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Heart className="w-3 h-3 text-destructive" /> {user.favorites.length} favoritos
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3 text-primary" /> {user.watched.length} vistos
                  </span>
                  <span className="text-xs flex items-center gap-1 text-orange-400 font-medium">
                    <Flame className="w-3 h-3" /> {user.streak} días de racha
                  </span>
                </div>
              </div>

              {/* Friend request button */}
              <Button
                size="sm"
                variant={friendStatus === "none" ? "default" : friendStatus === "pending" ? "outline" : "secondary"}
                onClick={handleFriendRequest}
                className="gap-2 shrink-0"
              >
                {friendStatus === "none" && <><UserPlus className="w-4 h-4" /> Agregar Amigo</>}
                {friendStatus === "pending" && <><Clock className="w-4 h-4" /> Pendiente</>}
                {friendStatus === "friends" && <><UserCheck className="w-4 h-4" /> Amigos</>}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Streak & Points section */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          {/* Streak card */}
          <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Racha Actual</p>
                <p className="text-xs text-muted-foreground">Días consecutivos activo</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">{user.streak}</span>
              <span className="text-sm text-muted-foreground">días</span>
            </div>
            <div className="flex gap-1 mt-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${i < Math.min(user.streak, 7) ? "bg-orange-400" : "bg-secondary"}`}
                />
              ))}
            </div>
          </div>

          {/* Points/Level card */}
          <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Nivel {user.level}</p>
                <p className="text-xs text-muted-foreground">{levelNames[user.level] || "Leyenda"}</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold text-foreground">{user.points}</span>
              <span className="text-sm text-muted-foreground">puntos</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-1">
              {pointsPerLevel - (user.points % pointsPerLevel)} puntos para nivel {user.level + 1}
            </p>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Insignias</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {user.badges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div key={i} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                  badge.unlocked
                    ? "border-border/50 bg-secondary/30"
                    : "border-border/20 bg-secondary/10 opacity-40"
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    badge.unlocked ? "bg-secondary" : "bg-secondary/50"
                  }`}>
                    {badge.unlocked ? (
                      <Icon className={`w-5 h-5 ${badge.color}`} />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Pro Features unlock progress */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-foreground">Opciones Pro</h2>
          </div>
          <div className="space-y-3">
            {proFeatures.map((feat) => {
              const Icon = feat.icon;
              const unlocked = user.points >= feat.points;
              const progress = Math.min((user.points / feat.points) * 100, 100);
              return (
                <div key={feat.label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    unlocked ? "bg-primary/10" : "bg-secondary/50"
                  }`}>
                    {unlocked ? <Icon className="w-4 h-4 text-primary" /> : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{feat.label}</span>
                      <span className="text-[10px] text-muted-foreground">{feat.points} pts</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* User's favorites */}
        {userFavMovies.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-destructive" /> Películas favoritas de {user.name.split(" ")[0]}
            </h2>
            <div className="flex flex-wrap gap-4">
              {userFavMovies.map((m, i) => (
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
