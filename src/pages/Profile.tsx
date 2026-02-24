import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Globe, Shield, Lock, Camera, Image,
  ArrowLeft, Eye, EyeOff, Send, Inbox, Pencil, Check, X,
  Heart, Search, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useMovieLists } from "@/contexts/MovieListsContext";
import MovieCard from "@/components/MovieCard";
import movieData, { heroMovie } from "@/data/movies";
import UserSearchModal from "@/components/UserSearchModal";
import ProfileRequestsContent from "@/components/ProfileRequestsContent";
import ProfileChatsContent from "@/components/ProfileChatsContent";

type TabKey = "mylist" | "security" | "requests" | "chats";

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "mylist", label: "Mi Lista", icon: Heart },
  { key: "requests", label: "Solicitudes", icon: Inbox },
  { key: "chats", label: "Chats", icon: MessageCircle },
  { key: "security", label: "Seguridad", icon: Shield },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const allMovies = [heroMovie, ...movieData];

const availableCovers = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=400&fit=crop",
];

const availableAvatars = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop",
];

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("mylist");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { favorites, watched } = useMovieLists();
  const [listSubTab, setListSubTab] = useState<"favorites" | "watched">("favorites");
  const [showUserSearch, setShowUserSearch] = useState(false);

  const [profile, setProfile] = useState({
    name: "Carlos Mendoza",
    username: "@carlosm",
    email: "carlos.mendoza@email.com",
    phone: "+52 55 1234 5678",
    gender: "Masculino",
    country: "México",
    avatar: "",
    cover: "",
  });

  const [editProfile, setEditProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editProfile);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile((p) => ({ ...p, cover: url }));
      setShowCoverPicker(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile((p) => ({ ...p, avatar: url }));
      setShowAvatarPicker(false);
    }
  };

  const favoriteMovies = allMovies.filter((m) => favorites.includes(m.id));
  const watchedMovies = allMovies.filter((m) => watched.includes(m.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full bg-accent/6 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>
        </motion.div>

        {/* Profile Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden mb-8"
        >
          {/* Cover photo with change button */}
          <div className="h-36 sm:h-48 relative group">
            {profile.cover ? (
              <img src={profile.cover} alt="Portada" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
            {/* Cover change button */}
            <button
              onClick={() => setShowCoverPicker(true)}
              className="absolute bottom-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/70 backdrop-blur-sm border border-border/50 text-foreground text-xs font-medium hover:bg-background/90 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" /> Cambiar portada
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </div>

          {/* Cover picker modal */}
          <AnimatePresence>
            {showCoverPicker && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-6"
                onClick={(e) => { if (e.target === e.currentTarget) setShowCoverPicker(false); }}
              >
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-sm bg-card border border-border rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">Elegir portada</h3>
                    <button onClick={() => setShowCoverPicker(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {availableCovers.map((url, i) => (
                      <button key={i} onClick={() => { setProfile((p) => ({ ...p, cover: url })); setShowCoverPicker(false); }}
                        className="h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                      >
                        <img src={url} alt={`Cover ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => coverInputRef.current?.click()}>
                    <Camera className="w-3.5 h-3.5 mr-1.5" /> Subir desde galería
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-6 sm:px-10 pb-6 -mt-14 sm:-mt-16 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              {/* Avatar */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-card bg-secondary flex items-center justify-center overflow-hidden shadow-2xl shadow-primary/10">
                  {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-muted-foreground" />}
                </div>
                <div className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-6 h-6 text-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </motion.div>

              {/* Avatar picker modal */}
              <AnimatePresence>
                {showAvatarPicker && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-6"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowAvatarPicker(false); }}
                  >
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                      className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">Elegir foto de perfil</h3>
                        <button onClick={() => setShowAvatarPicker(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {availableAvatars.map((url, i) => (
                          <button key={i} onClick={() => { setProfile((p) => ({ ...p, avatar: url })); setShowAvatarPicker(false); }}
                            className="aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                          >
                            <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => avatarInputRef.current?.click()}>
                        <Camera className="w-4 h-4 mr-2" /> Subir desde galería
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name + stats + edit button */}
              <div className="flex-1 text-center sm:text-left sm:pb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{profile.name}</h1>
                <p className="text-muted-foreground text-sm mt-0.5">{profile.username}</p>
                <div className="flex items-center gap-3 mt-1 justify-center sm:justify-start">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Heart className="w-3 h-3 text-destructive" /> {favorites.length} favoritos
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3 text-primary" /> {watched.length} vistos
                  </span>
                </div>
              </div>

              {/* Search + Edit buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUserSearch(true)}
                  className="gap-2"
                >
                  <Search className="w-4 h-4" /> Buscar
                </Button>
                <Button
                  variant={isEditing ? "ghost" : "outline"}
                  size="sm"
                  onClick={() => { if (isEditing) handleCancelEdit(); else { setEditProfile(profile); setIsEditing(true); } }}
                  className="gap-2"
                >
                  {isEditing ? <><X className="w-4 h-4" /> Cancelar</> : <><Pencil className="w-4 h-4" /> Editar Perfil</>}
                </Button>
              </div>
            </div>
          </div>

          {/* Inline edit form */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border/30"
              >
                <div className="px-6 sm:px-10 py-6 space-y-3">
                  {[
                    { key: "name", label: "Nombre completo", icon: User },
                    { key: "username", label: "Usuario", icon: User },
                    { key: "email", label: "Correo electrónico", icon: Mail },
                    { key: "phone", label: "Teléfono", icon: Phone },
                    { key: "gender", label: "Género", icon: User },
                    { key: "country", label: "País", icon: Globe },
                  ].map((field) => {
                    const Icon = field.icon;
                    return (
                      <div key={field.key} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{field.label}</label>
                          <Input
                            value={(editProfile as any)[field.key]}
                            onChange={(e) => setEditProfile({ ...editProfile, [field.key]: e.target.value })}
                            className="h-8 text-sm bg-secondary/40 border-border/50 mt-0.5"
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                      <Check className="w-4 h-4" /> Guardar Cambios
                    </Button>
                    <Button variant="ghost" onClick={handleCancelEdit}>Cancelar</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search Modal */}

        {/* Search Modal */}
        <UserSearchModal open={showUserSearch} onClose={() => setShowUserSearch(false)} />

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {isActive && (
                  <motion.div layoutId="profileTab" className="absolute inset-0 rounded-xl bg-primary shadow-lg shadow-primary/25"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10 flex items-center gap-2"><Icon className="w-4 h-4" /> {tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "mylist" && (
            <motion.div key="mylist" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="flex gap-2">
                {([
                  { key: "favorites" as const, label: "Favoritos", icon: Heart, count: favorites.length },
                  { key: "watched" as const, label: "Vistos", icon: Eye, count: watched.length },
                ]).map((t) => {
                  const Icon = t.icon;
                  const active = listSubTab === t.key;
                  return (
                    <button key={t.key} onClick={() => setListSubTab(t.key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground bg-secondary/30 border border-border/30"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {t.label}
                      <span className="bg-background/30 rounded-full px-1.5 py-0.5 text-[10px]">{t.count}</span>
                    </button>
                  );
                })}
              </div>
              {(() => {
                const movies = listSubTab === "favorites" ? favoriteMovies : watchedMovies;
                if (movies.length === 0) {
                  return (
                    <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 text-center">
                      <div className="w-14 h-14 rounded-full bg-secondary/80 flex items-center justify-center mx-auto mb-3">
                        {listSubTab === "favorites" ? <Heart className="w-6 h-6 text-muted-foreground" /> : <Eye className="w-6 h-6 text-muted-foreground" />}
                      </div>
                      <p className="text-foreground font-medium">{listSubTab === "favorites" ? "No tienes favoritos aún" : "No has marcado películas como vistas"}</p>
                      <p className="text-xs text-muted-foreground mt-1">{listSubTab === "favorites" ? "Marca películas con ❤️ desde la página principal" : "Marca películas con 👁 desde la página principal"}</p>
                    </div>
                  );
                }
                return <div className="flex flex-wrap gap-4">{movies.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}</div>;
              })()}
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div key="security" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Lock className="w-5 h-5 text-primary" /></div>
                  <h3 className="text-lg font-semibold text-foreground">Cambiar Contraseña</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Contraseña actual</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="bg-secondary/50 border-border/50 pr-10" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Nueva contraseña</label>
                    <div className="relative">
                      <Input type={showNewPassword ? "text" : "password"} placeholder="••••••••" className="bg-secondary/50 border-border/50 pr-10" />
                      <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Confirmar contraseña</label>
                    <Input type="password" placeholder="••••••••" className="bg-secondary/50 border-border/50" />
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">Actualizar Contraseña</Button>
                </div>
              </motion.div>

              <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><Shield className="w-5 h-5 text-accent" /></div>
                  <h3 className="text-lg font-semibold text-foreground">Privacidad</h3>
                </div>
                <div className="space-y-3">
                  <PrivacyToggle label="Perfil público" description="Otros usuarios pueden ver tu perfil" defaultOn />
                  <Separator className="bg-border/30" />
                  <PrivacyToggle label="Mostrar actividad" description="Muestra tu actividad reciente" defaultOn={false} />
                  <Separator className="bg-border/30" />
                  <PrivacyToggle label="Notificaciones por email" description="Recibe novedades en tu correo" defaultOn />
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "requests" && (
            <motion.div key="requests" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ProfileRequestsContent />
            </motion.div>
          )}

          {activeTab === "chats" && (
            <motion.div key="chats" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ProfileChatsContent />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function PrivacyToggle({ label, description, defaultOn }: { label: string; description: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button onClick={() => setOn(!on)} className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${on ? "bg-primary" : "bg-secondary"}`}>
        <motion.div animate={{ x: on ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-4 h-4 rounded-full bg-foreground shadow-sm" />
      </button>
    </div>
  );
}

export default Profile;
