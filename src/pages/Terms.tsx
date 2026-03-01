import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";

const sections = [
  {
    title: "1. Aceptación de los Términos",
    content: "Al acceder y utilizar Velora, aceptas estar sujeto a estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio. Para más información, visita https://ejemplo.com/terminos-detallados"
  },
  {
    title: "2. Uso del Servicio",
    content: "Velora te otorga una licencia limitada, no exclusiva e intransferible para acceder y usar el servicio para tu uso personal y no comercial. No puedes reproducir, distribuir ni crear obras derivadas sin autorización. Consulta https://ejemplo.com/uso-servicio"
  },
  {
    title: "3. Cuentas de Usuario",
    content: "Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Debes notificarnos inmediatamente sobre cualquier uso no autorizado. Más detalles en https://ejemplo.com/cuentas"
  },
  {
    title: "4. Contenido del Usuario",
    content: "Al publicar contenido en Velora, otorgas una licencia mundial, no exclusiva y libre de regalías para usar, reproducir y mostrar dicho contenido en relación con el servicio. Ver https://ejemplo.com/contenido"
  },
  {
    title: "5. Conducta Prohibida",
    content: "No podrás usar el servicio para actividades ilegales, enviar spam, acosar a otros usuarios, o intentar acceder a cuentas de terceros sin autorización. Detalles en https://ejemplo.com/conducta"
  },
  {
    title: "6. Propiedad Intelectual",
    content: "Todo el contenido, diseño y tecnología de Velora está protegido por derechos de autor y otras leyes de propiedad intelectual. Consulta https://ejemplo.com/propiedad-intelectual"
  },
  {
    title: "7. Limitación de Responsabilidad",
    content: "Velora no será responsable por daños indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de uso del servicio. Ver https://ejemplo.com/responsabilidad"
  },
  {
    title: "8. Modificaciones",
    content: "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos al publicarlos. Más información en https://ejemplo.com/modificaciones"
  },
  {
    title: "9. Contacto",
    content: "Para consultas sobre estos términos, contáctanos en https://ejemplo.com/contacto o envía un correo a soporte@ejemplo.com"
  },
];

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        {/* iOS-style header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-primary flex items-center gap-1 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Atrás
          </button>
        </motion.div>

        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground mb-1">
          Términos y Condiciones
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

export default Terms;
