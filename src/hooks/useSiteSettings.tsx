import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettingsContextType {
  settings: Record<string, string>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const DEFAULTS: Record<string, string> = {
  color_primary: "#FF4500",
  color_accent: "#FF8C00",
  color_background: "#0A0A0A",
  color_card: "#141414",
  color_foreground: "#F2F2F2",
  color_muted: "#999999",
  text_appName: "Velora",
  text_heroTitle: "Bienvenido",
  text_heroDesc: "Tu plataforma de películas favorita",
  text_footerText: "© 2025 Velora. Todos los derechos reservados.",
};

function hexToHsl(hex: string): string {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULTS,
  loading: true,
  refresh: async () => {},
});

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase.from("site_settings").select("key, value");
    const map: Record<string, string> = { ...DEFAULTS };
    (data || []).forEach((s: any) => { map[s.key] = s.value; });
    setSettings(map);
    setLoading(false);
    applyColors(map);
  };

  const applyColors = (s: Record<string, string>) => {
    const root = document.documentElement;
    const colorMap: Record<string, string> = {
      color_primary: "--primary",
      color_accent: "--accent",
      color_background: "--background",
      color_card: "--card",
      color_foreground: "--foreground",
      color_muted: "--muted-foreground",
    };
    Object.entries(colorMap).forEach(([key, cssVar]) => {
      if (s[key] && s[key] !== DEFAULTS[key]) {
        root.style.setProperty(cssVar, hexToHsl(s[key]));
      }
    });
  };

  useEffect(() => { fetch(); }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh: fetch }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
