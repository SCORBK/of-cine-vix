import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Globe, Shield, Lock, Camera,
  ArrowLeft, Eye, EyeOff, Pencil, Check, X,
  Heart, Search, MessageCircle, Inbox, CheckCircle2, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useMovieLists } from "@/contexts/MovieListsContext";
import MovieCard from "@/components/MovieCard";
import type { DbMovie } from "@/types/movie";
import UserSearchModal from "@/components/UserSearchModal";
import ProfileRequestsContent from "@/components/ProfileRequestsContent";
import ProfileChatsContent from "@/components/ProfileChatsContent";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("mylist");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { favorites, watched } = useMovieLists();
  const [listSubTab, setListSubTab] = useState<"favorites" | "watched">("favorites");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [galleryAvatars, setGalleryAvatars] = useState<any[]>([]);
  const [galleryCovers, setGalleryCovers] = useState<any[]>([]);

  const [editForm, setEditForm] = useState({
    display_name: "", username: "", phone: "", country: "", bio: "",
  });

  const [passwords, setPasswords] = useState({ current: "", new_password: "", confirm: "" });

  useEffect(() => {
    if (profile) {
      setEditForm({
        display_name: profile.display_name || "",
        username: profile.username || "",
        phone: profile.phone || "",
        country: profile.country || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user]);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase.from("avatar_gallery").select("*").order("created_at", { ascending: false });
      if (data) {
        setGalleryAvatars(data.filter((g: any) => g.type === "avatar"));
        setGalleryCovers(data.filter((g: any) => g.type === "cover"));
      }
    };
    fetchGallery();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      display_name: editForm.display_name, username: editForm.username,
      phone: editForm.phone, country: editForm.country, bio: editForm.bio,
    }).eq("user_id", user.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Perfil actualizado" }); await refreshProfile(); setIsEditing(false); }
  };

  const handlePasswordChange = async () => {
    if (passwords.new_password !== passwords.confirm) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" }); return;
    }
    const { error } = await supabase.auth.updateUser({ password: passwords.new_password });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Contraseña actualizada" }); setPasswords({ current: "", new_password: "", confirm: "" }); }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/cover.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("user-uploads").upload(path, file, { upsert: true });
    if (uploadErr) { toast({ title: "Error", description: uploadErr.message, variant: "destructive" }); return; }
    const { data: { publicUrl } } = supabase.storage.from("user-uploads").getPublicUrl(path);
    await supabase.from("profiles").update({ cover_url: publicUrl }).eq("user_id", user.id);
    refreshProfile();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("user-uploads").upload(path, file, { upsert: true });
    if (uploadErr) { toast({ title: "Error", description: uploadErr.message, variant: "destructive" }); return; }
    const { data: { publicUrl } } = supabase.storage.from("user-uploads").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
    refreshProfile();
  };

  const selectGalleryImage = async (url: string, type: "avatar" | "cover") => {
    if (!user) return;
    const field = type === "avatar" ? "avatar_url" : "cover_url";
    await supabase.from("profiles").update({ [field]: url }).eq("user_id", user.id);
    refreshProfile();
    toast({ title: type === "avatar" ? "Avatar actualizado" : "Portada actualizada" });
    setShowAvatarPicker(false);
    setShowCoverPicker(false);
  };

  const [favoriteMovies, setFavoriteMovies] = useState<DbMovie[]>([]);
  const [watchedMovies, setWatchedMovies] = useState<DbMovie[]>([]);

  useEffect(() => {
    const fetchMovies = async (ids: string[], setter: (m: DbMovie[]) => void) => {
      if (ids.length === 0) { setter([]); return; }
      const { data } = await supabase.from("movies").select("*").in("id", ids);
      setter((data as DbMovie[]) || []);
    };
    fetchMovies(favorites, setFavoriteMovies);
    fetchMovies(watched, setWatchedMovies);
  }, [favorites, watched]);

  if (!user || !profile) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Cargando perfil...</p></div>;
  }

  const GalleryPicker = ({ type, items, onClose }: { type: "avatar" | "cover"; items: any[]; onClose: () => void }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Image className="w-4 h-4 text-primary" />
            {type === "avatar" ? "Elegir foto de perfil" : "Elegir portada"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-4 max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay opciones disponibles. Sube una desde tu galería.</p>
          ) : (
            <div className={`grid gap-3 ${type === "avatar" ? "grid-cols-4" : "grid-cols-2"}`}>
              {items.map((item) => (
                <button key={item.id} onClick={() => selectGalleryImage(item.url, type)}
                  className={`rounded-xl border-2 border-border/30 hover:border-primary overflow-hidden transition-all ${type === "avatar" ? "aspect-square" : "aspect-video"}`}
                >
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-border/30">
          <Button variant="outline" size="sm" className="w-full gap-2"
            onClick={() => { onClose(); type === "avatar" ? avatarInputRef.current?.click() : coverInputRef.current?.click(); }}
          >
            <Camera className="w-4 h-4" /> Subir desde galería
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );

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
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden mb-8"
        >
          <div className="h-36 sm:h-48 relative group">
            {profile.cover_url ? (
              <img src={profile.cover_url} alt="Portada" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
            <button onClick={() => galleryCovers.length > 0 ? setShowCoverPicker(true) : coverInputRef.current?.click()}
              className="absolute bottom-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/70 backdrop-blur-sm border border-border/50 text-foreground text-xs font-medium hover:bg-background/90 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" /> Cambiar portada
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </div>

          <div className="px-6 sm:px-10 pb-6 -mt-14 sm:-mt-16 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              <motion.div whileHover={{ scale: 1.05 }} className="relative group cursor-pointer"
                onClick={() => galleryAvatars.length > 0 ? setShowAvatarPicker(true) : avatarInputRef.current?.click()}
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-card bg-secondary flex items-center justify-center overflow-hidden shadow-2xl shadow-primary/10">
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-muted-foreground" />}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </motion.div>

              <div className="flex-1 text-center sm:text-left sm:pb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 justify-center sm:justify-start">
                  {profile.display_name || "Sin nombre"}
                  {(profile as any).verified && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">@{profile.username || "usuario"}</p>
                <div className="flex items-center gap-3 mt-1 justify-center sm:justify-start">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Heart className="w-3 h-3 text-destructive" /> {favorites.length} favoritos
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3 text-primary" /> {watched.length} vistos
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setShowUserSearch(true)} className="gap-2">
                  <Search className="w-4 h-4" /> Buscar
                </Button>
                <Button variant={isEditing ? "ghost" : "outline"} size="sm"
                  onClick={() => setIsEditing(!isEditing)} className="gap-2"
                >
                  {isEditing ? <><X className="w-4 h-4" /> Cancelar</> : <><Pencil className="w-4 h-4" /> Editar Perfil</>}
                </Button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isEditing && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border/30"
              >
                <div className="px-6 sm:px-10 py-6 space-y-3">
                  {[
                    { key: "display_name", label: "Nombre completo", icon: User },
                    { key: "username", label: "Usuario", icon: User },
                    { key: "phone", label: "Teléfono", icon: Phone },
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
                          <Input value={(editForm as any)[field.key]}
                            onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                            className="h-8 text-sm bg-secondary/40 border-border/50 mt-0.5" />
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                      <Check className="w-4 h-4" /> Guardar Cambios
                    </Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <UserSearchModal open={showUserSearch} onClose={() => setShowUserSearch(false)} />

        {/* Gallery Pickers */}
        <AnimatePresence>
          {showAvatarPicker && <GalleryPicker type="avatar" items={galleryAvatars} onClose={() => setShowAvatarPicker(false)} />}
          {showCoverPicker && <GalleryPicker type="cover" items={galleryCovers} onClose={() => setShowCoverPicker(false)} />}
        </AnimatePresence>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
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
                    <label className="text-sm text-muted-foreground mb-1.5 block">Nueva contraseña</label>
                    <div className="relative">
                      <Input type={showNewPassword ? "text" : "password"} placeholder="••••••••" value={passwords.new_password}
                        onChange={(e) => setPasswords(p => ({ ...p, new_password: e.target.value }))}
                        className="bg-secondary/50 border-border/50 pr-10" />
                      <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Confirmar contraseña</label>
                    <Input type="password" placeholder="••••••••" value={passwords.confirm}
                      onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                      className="bg-secondary/50 border-border/50" />
                  </div>
                  <Button onClick={handlePasswordChange} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                    Actualizar Contraseña
                  </Button>
                </div>
              </motion.div>

              <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><Shield className="w-5 h-5 text-accent" /></div>
                  <h3 className="text-lg font-semibold text-foreground">Información de la cuenta</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Correo: <span className="text-foreground">{user?.email}</span></p>
                  <p className="text-muted-foreground">ID: <span className="text-foreground font-mono text-xs">{user?.id?.slice(0, 8)}...</span></p>
                  <p className="text-muted-foreground">Registrado: <span className="text-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString("es-MX") : "—"}</span></p>
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

export default Profile;
