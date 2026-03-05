import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, Type, ChevronDown, Save, Loader2, Upload, Image, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const COLOR_KEYS = [
  { key: "color_primary", label: "Color Primario", default: "#FF4500" },
  { key: "color_accent", label: "Color de Acento", default: "#FF8C00" },
  { key: "color_background", label: "Fondo Principal", default: "#0A0A0A" },
  { key: "color_card", label: "Fondo Tarjetas", default: "#141414" },
  { key: "color_foreground", label: "Texto Principal", default: "#F2F2F2" },
  { key: "color_muted", label: "Texto Secundario", default: "#999999" },
];

const TEXT_KEYS = [
  { key: "text_appName", label: "Nombre de la App", default: "Velora" },
  { key: "text_heroTitle", label: "Título del Hero", default: "Bienvenido" },
  { key: "text_heroDesc", label: "Descripción del Hero", default: "Tu plataforma de películas favorita" },
  { key: "text_footerText", label: "Texto del Footer", default: "© 2025 Velora. Todos los derechos reservados." },
];

type Section = "colors" | "texts" | "avatars" | "covers";

const AdminCustomizeTab = () => {
  const { toast } = useToast();
  const { refresh: refreshSiteSettings } = useSiteSettings();
  const [openSection, setOpenSection] = useState<Section>("colors");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [galleryAvatars, setGalleryAvatars] = useState<any[]>([]);
  const [galleryCovers, setGalleryCovers] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchGallery();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("key, value");
    const map: Record<string, string> = {};
    (data || []).forEach((s: any) => { map[s.key] = s.value; });
    [...COLOR_KEYS, ...TEXT_KEYS].forEach(k => { if (!map[k.key]) map[k.key] = k.default; });
    setSettings(map);
    setLoading(false);
  };

  const fetchGallery = async () => {
    const { data } = await supabase.from("avatar_gallery").select("*").order("created_at", { ascending: false });
    if (data) {
      setGalleryAvatars(data.filter((g: any) => g.type === "avatar"));
      setGalleryCovers(data.filter((g: any) => g.type === "cover"));
    }
  };

  const handleSave = async (keys: { key: string; default: string }[]) => {
    setSaving(true);
    for (const k of keys) {
      const value = settings[k.key] || k.default;
      await supabase.from("site_settings").upsert({ key: k.key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    }
    toast({ title: "Configuración guardada" });
    setSaving(false);
    refreshSiteSettings();
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `gallery/${type}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("user-uploads").upload(path, file);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); continue; }
      const { data: { publicUrl } } = supabase.storage.from("user-uploads").getPublicUrl(path);
      await supabase.from("avatar_gallery").insert({ url: publicUrl, type });
    }
    setUploading(false);
    fetchGallery();
    toast({ title: `${type === "avatar" ? "Avatares" : "Portadas"} subidos` });
    e.target.value = "";
  };

  const deleteGalleryItem = async (id: string) => {
    await supabase.from("avatar_gallery").delete().eq("id", id);
    fetchGallery();
    toast({ title: "Eliminado" });
  };

  if (loading) return <p className="text-sm text-muted-foreground text-center py-8">Cargando configuración...</p>;

  const renderGallerySection = (type: "avatar" | "cover", items: any[]) => (
    <div className="px-5 pb-5">
      <div className="flex items-center gap-3 mb-4">
        <label className="cursor-pointer">
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleGalleryUpload(e, type)} />
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
            <Upload className="w-3.5 h-3.5" /> {uploading ? "Subiendo..." : `Subir ${type === "avatar" ? "avatares" : "portadas"}`}
          </div>
        </label>
        <p className="text-xs text-muted-foreground">{items.length} disponibles</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No hay {type === "avatar" ? "avatares" : "portadas"} predefinidos</p>
      ) : (
        <div className={`grid gap-3 ${type === "avatar" ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-2 sm:grid-cols-3"}`}>
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <img src={item.url} alt="" className={`w-full object-cover rounded-lg border border-border/30 ${type === "avatar" ? "aspect-square" : "aspect-video"}`} />
              <button onClick={() => deleteGalleryItem(item.id)}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Colors */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
        <button onClick={() => setOpenSection("colors")} className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Palette className="w-5 h-5 text-primary" /></div>
            <div className="text-left"><p className="text-sm font-semibold text-foreground">Colores de la App</p><p className="text-xs text-muted-foreground">Personaliza la paleta de colores</p></div>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSection === "colors" ? "rotate-180" : ""}`} />
        </button>
        {openSection === "colors" && (
          <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COLOR_KEYS.map((color) => (
              <div key={color.key} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-secondary/20">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg border-2 border-border" style={{ backgroundColor: settings[color.key] || color.default }} />
                  <input type="color" value={settings[color.key] || color.default}
                    onChange={(e) => setSettings(s => ({ ...s, [color.key]: e.target.value }))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{color.label}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{settings[color.key] || color.default}</p>
                </div>
              </div>
            ))}
            <div className="sm:col-span-2 pt-2">
              <Button onClick={() => handleSave(COLOR_KEYS)} disabled={saving} className="w-full gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar Colores
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Texts */}
      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
        <button onClick={() => setOpenSection("texts")} className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Type className="w-5 h-5 text-accent" /></div>
            <div className="text-left"><p className="text-sm font-semibold text-foreground">Textos de la App</p><p className="text-xs text-muted-foreground">Cambia los textos principales</p></div>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSection === "texts" ? "rotate-180" : ""}`} />
        </button>
        {openSection === "texts" && (
          <div className="px-5 pb-5 space-y-3">
            {TEXT_KEYS.map((text) => (
              <div key={text.key} className="space-y-1">
                <label className="text-xs text-muted-foreground">{text.label}</label>
                <Input value={settings[text.key] || text.default} onChange={(e) => setSettings(s => ({ ...s, [text.key]: e.target.value }))}
                  className="bg-secondary/40 border-border/50 text-sm" />
              </div>
            ))}
            <Button onClick={() => handleSave(TEXT_KEYS)} disabled={saving} className="w-full gap-2 mt-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar Textos
            </Button>
          </div>
        )}
      </motion.div>

      {/* Avatar Gallery */}
      <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
        <button onClick={() => setOpenSection("avatars")} className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Image className="w-5 h-5 text-primary" /></div>
            <div className="text-left"><p className="text-sm font-semibold text-foreground">Fotos de Perfil</p><p className="text-xs text-muted-foreground">Sube avatares predefinidos para los usuarios</p></div>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSection === "avatars" ? "rotate-180" : ""}`} />
        </button>
        {openSection === "avatars" && renderGallerySection("avatar", galleryAvatars)}
      </motion.div>

      {/* Cover Gallery */}
      <motion.div custom={3} variants={fadeIn} initial="hidden" animate="visible" className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
        <button onClick={() => setOpenSection("covers")} className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Image className="w-5 h-5 text-accent" /></div>
            <div className="text-left"><p className="text-sm font-semibold text-foreground">Portadas</p><p className="text-xs text-muted-foreground">Sube portadas predefinidas para los usuarios</p></div>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSection === "covers" ? "rotate-180" : ""}`} />
        </button>
        {openSection === "covers" && renderGallerySection("cover", galleryCovers)}
      </motion.div>
    </div>
  );
};

export default AdminCustomizeTab;
