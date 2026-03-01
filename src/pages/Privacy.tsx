import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";

const sections = [
  {
    title: "1. Información que Recopilamos",
    content: "Recopilamos información personal como nombre, correo electrónico, y datos de uso del servicio para mejorar tu experiencia. Ver detalles en https://ejemplo.com/datos-recopilados"
  },
  {
    title: "2. Cómo Usamos tu Información",
    content: "Utilizamos tu información para proporcionar, mantener y mejorar el servicio, personalizar tu experiencia, y comunicarnos contigo. Más información en https://ejemplo.com/uso-datos"
  },
  {
    title: "3. Compartir Información",
    content: "No vendemos tu información personal a terceros. Solo compartimos datos con proveedores de servicios necesarios para el funcionamiento de Velora. Consulta https://ejemplo.com/compartir-datos"
  },
  {
    title: "4. Almacenamiento y Seguridad",
    content: "Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado. Ver https://ejemplo.com/seguridad"
  },
  {
    title: "5. Cookies y Tecnologías Similares",
    content: "Utilizamos cookies y tecnologías similares para mejorar la funcionalidad del servicio y analizar el uso. Más detalles en https://ejemplo.com/cookies"
  },
  {
    title: "6. Tus Derechos",
    content: "Tienes derecho a acceder, rectificar, eliminar y portar tus datos personales. También puedes oponerte al procesamiento de tus datos. Consulta https://ejemplo.com/derechos"
  },
  {
    title: "7. Retención de Datos",
    content: "Conservamos tu información personal mientras tu cuenta esté activa o según sea necesario para proporcionarte el servicio. Ver https://ejemplo.com/retencion"
  },
  {
    title: "8. Menores de Edad",
    content: "Velora no está dirigido a menores de 13 años. No recopilamos intencionalmente información de menores. Más información en https://ejemplo.com/menores"
  },
  {
    title: "9. Contacto",
    content: "Para consultas sobre privacidad, contáctanos en https://ejemplo.com/privacidad-contacto o envía un correo a privacidad@ejemplo.com"
  },
];

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-primary flex items-center gap-1 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Atrás
          </button>
        </motion.div>

        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground mb-1">
          Políticas de Privacidad
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-6">Última actualización: Marzo 2026</p>

        <div className="space-y-2">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl bg-card/60 border border-border/50 overflow-hidden"
            >
              <details className="group">
                <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer list-none">
                  <span className="text-sm font-medium text-foreground">{section.title}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              </details>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Privacy;
