import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertTriangle, MessageCircle, User, Film } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

type TicketStatus = "pending" | "in_progress" | "resolved";

interface MockTicket {
  id: number;
  user: string;
  userAvatar: string;
  movie: string;
  category: string;
  message: string;
  status: TicketStatus;
  date: string;
  hasChat: boolean;
}

const mockTickets: MockTicket[] = [
  {
    id: 1,
    user: "Carlos Méndez",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
    movie: "Neón 2099",
    category: "Video no carga",
    message: "El video se queda en negro después del minuto 45, ya intenté recargar varias veces.",
    status: "pending",
    date: "Hace 2 horas",
    hasChat: false,
  },
  {
    id: 2,
    user: "Ana García",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
    movie: "Furia Extrema",
    category: "Subtítulos incorrectos",
    message: "Los subtítulos en español están desfasados como 3 segundos respecto al audio.",
    status: "in_progress",
    date: "Hace 5 horas",
    hasChat: true,
  },
  {
    id: 3,
    user: "Miguel Torres",
    userAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop",
    movie: "El Bosque Maldito",
    category: "Problema de audio",
    message: "El audio se escucha con eco en toda la película.",
    status: "resolved",
    date: "Hace 1 día",
    hasChat: true,
  },
  {
    id: 4,
    user: "Laura Ruiz",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
    movie: "Amor en Tiempos Modernos",
    category: "Error / Bug",
    message: "La app se cierra sola cuando intento ver esta película en mi tablet.",
    status: "pending",
    date: "Hace 3 horas",
    hasChat: false,
  },
];

const statusConfig: Record<TicketStatus, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  pending: {
    label: "Pendiente",
    icon: AlertTriangle,
    bg: "bg-accent/10",
    text: "text-accent",
    border: "border-accent/20",
  },
  in_progress: {
    label: "En Proceso",
    icon: Clock,
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
  },
  resolved: {
    label: "Resuelto",
    icon: CheckCircle2,
    bg: "bg-accent/10",
    text: "text-accent",
    border: "border-accent/20",
  },
};

interface AdminReportsTabProps {
  onStatusChange?: (ticketId: number, newStatus: TicketStatus) => void;
}

const AdminReportsTab = ({ onStatusChange }: AdminReportsTabProps) => {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {([
          { status: "pending" as TicketStatus, count: mockTickets.filter(t => t.status === "pending").length },
          { status: "in_progress" as TicketStatus, count: mockTickets.filter(t => t.status === "in_progress").length },
          { status: "resolved" as TicketStatus, count: mockTickets.filter(t => t.status === "resolved").length },
        ]).map((item, i) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;
          return (
            <motion.div
              key={item.status}
              custom={i}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className={`rounded-xl border ${config.border} ${config.bg} p-4 flex items-center gap-3`}
            >
              <Icon className={`w-5 h-5 ${config.text}`} />
              <div>
                <p className={`text-xl font-bold ${config.text}`}>{item.count}</p>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Ticket list */}
      <div className="space-y-4">
        {mockTickets.map((ticket, i) => {
          const config = statusConfig[ticket.status];
          const StatusIcon = config.icon;
          return (
            <motion.div
              key={ticket.id}
              custom={i}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden"
            >
              {/* Ticket header */}
              <div className="px-5 py-4 flex items-start gap-4">
                <img
                  src={ticket.userAvatar}
                  alt={ticket.user}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-border"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{ticket.user}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.text} border ${config.border}`}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Film className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{ticket.movie}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{ticket.category}</span>
                  </div>
                  <p className="text-sm text-foreground/80 mt-2">{ticket.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{ticket.date}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 border-t border-border/30 flex items-center gap-2 flex-wrap">
                {ticket.status !== "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStatusChange?.(ticket.id, "pending")}
                    className="text-xs gap-1 text-muted-foreground hover:text-accent"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Pendiente
                  </Button>
                )}
                {ticket.status !== "in_progress" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStatusChange?.(ticket.id, "in_progress")}
                    className="text-xs gap-1 text-muted-foreground hover:text-primary"
                  >
                    <Clock className="w-3 h-3" />
                    En Proceso
                  </Button>
                )}
                {ticket.status !== "resolved" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStatusChange?.(ticket.id, "resolved")}
                    className="text-xs gap-1 text-muted-foreground hover:text-accent"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Resuelto
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1 text-muted-foreground hover:text-primary ml-auto"
                >
                  <MessageCircle className="w-3 h-3" />
                  {ticket.hasChat ? "Ver Chat" : "Iniciar Chat"}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminReportsTab;
