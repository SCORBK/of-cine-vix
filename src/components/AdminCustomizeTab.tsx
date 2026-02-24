import { useState } from "react";
import { motion } from "framer-motion";
import {
  Palette, Type, Image, Plus, Trash2, Upload, Play, GripVertical,
  Monitor, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

interface ColorSetting {
  key: string;
  label: string;
  value: string;
}

interface CarouselSlide {
  id: number;
  type: "image" | "video";
  url: string;
  title: string;
}

const mockColors: ColorSetting[] = [
  { key: "primary", label: "Color Primario", value: "#FF4500" },
  { key: "accent", label: "Color de Acento", value: "#FF8C00" },
  { key: "background", label: "Fondo Principal", value: "#0A0A0A" },
  { key: "card", label: "Fondo Tarjetas", value: "#141414" },
  { key: "foreground", label: "Texto Principal", value: "#F2F2F2" },
  { key: "muted", label: "Texto Secundario", value: "#999999" },
];

const mockTexts: { key: string; label: string; value: string }[] = [
  { key: "appName", label: "Nombre de la App", value: "Velora" },
  { key: "heroTitle", label: "Título del Hero", value: "Cenizas de Guerra" },
  { key: "heroDesc", label: "Descripción del Hero", value: "En un mundo devastado por el conflicto..." },
  { key: "footerText", label: "Texto del Footer", value: "© 2025 Velora. Todos los derechos reservados." },
];

const mockCarousel: CarouselSlide[] = [
  { id: 1, type: "image", url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&h=400&fit=crop", title: "Banner Principal" },
  { id: 2, type: "image", url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=900&h=400&fit=crop", title: "Estrenos" },
  { id: 3, type: "video", url: "https://example.com/trailer.mp4", title: "Tráiler Destacado" },
];

type Section = "colors" | "texts" | "carousel";

const AdminCustomizeTab = () => {
  const [openSection, setOpenSection] = useState<Section>("colors");
  const [colors, setColors] = useState(mockColors);
  const [texts, setTexts] = useState(mockTexts);
  const [carousel, setCarousel] = useState(mockCarousel);

  const toggleSection = (s: Section) => setOpenSection(openSection === s ? s : s);

  return (
    <div className="space-y-4">
      {/* Colors Section */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible"
        className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden"
      >
        <button onClick={() => toggleSection("colors")}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Colores de la App</p>
              <p className="text-xs text-muted-foreground">Personaliza la paleta de colores</p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSection === "colors" ? "rotate-180" : ""}`} />
        </button>
        {openSection === "colors" && (
          <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {colors.map((color, i) => (
              <div key={color.key} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-secondary/20">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg border-2 border-border" style={{ backgroundColor: color.value }} />
                  <input
                    type="color"
                    value={color.value}
                    onChange={(e) => {
                      const updated = [...colors];
                      updated[i].value = e.target.value;
                      setColors(updated);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{color.label}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{color.value}</p>
                </div>
              </div>
            ))}
            <div className="sm:col-span-2 pt-2">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Aplicar Colores
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Texts Section */}
      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible"
        className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden"
      >
        <button onClick={() => toggleSection("texts")}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Type className="w-5 h-5 text-accent" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Textos e Imágenes</p>
              <p className="text-xs text-muted-foreground">Cambia los textos principales de la app</p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSection === "texts" ? "rotate-180" : ""}`} />
        </button>
        {openSection === "texts" && (
          <div className="px-5 pb-5 space-y-3">
            {texts.map((text, i) => (
              <div key={text.key} className="space-y-1">
                <label className="text-xs text-muted-foreground">{text.label}</label>
                <Input
                  value={text.value}
                  onChange={(e) => {
                    const updated = [...texts];
                    updated[i].value = e.target.value;
                    setTexts(updated);
                  }}
                  className="bg-secondary/40 border-border/50 text-sm"
                />
              </div>
            ))}
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2">
              Guardar Textos
            </Button>
          </div>
        )}
      </motion.div>

      {/* Carousel Section */}
      <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible"
        className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden"
      >
        <button onClick={() => toggleSection("carousel")}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Carrusel Hero</p>
              <p className="text-xs text-muted-foreground">Imágenes y videos del banner principal</p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSection === "carousel" ? "rotate-180" : ""}`} />
        </button>
        {openSection === "carousel" && (
          <div className="px-5 pb-5 space-y-3">
            {carousel.map((slide, i) => (
              <div key={slide.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-secondary/20 group">
                <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0 cursor-grab" />
                <div className="w-20 h-12 rounded-lg overflow-hidden bg-secondary shrink-0 relative">
                  {slide.type === "image" ? (
                    <img src={slide.url} alt={slide.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <Play className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-0.5 left-0.5">
                    <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${slide.type === "video" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                      {slide.type === "video" ? "VIDEO" : "IMG"}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{slide.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{slide.url}</p>
                </div>
                <button
                  onClick={() => setCarousel(carousel.filter((s) => s.id !== slide.id))}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add new slide */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                className="gap-2 border-dashed"
                onClick={() => setCarousel([...carousel, { id: Date.now(), type: "image", url: "", title: `Slide ${carousel.length + 1}` }])}
              >
                <Image className="w-4 h-4" />
                Agregar Imagen
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-dashed"
                onClick={() => setCarousel([...carousel, { id: Date.now(), type: "video", url: "", title: `Video ${carousel.length + 1}` }])}
              >
                <Play className="w-4 h-4" />
                Agregar Video
              </Button>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-1">
              Guardar Carrusel
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminCustomizeTab;
