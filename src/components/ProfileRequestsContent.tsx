import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Heart, MessageCircle, Film, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type NotifType = "follow" | "like" | "comment" | "recommendation";

interface Notification {
  id: number;
  type: NotifType;
  user: string;
  username: string;
  avatar: string;
  userId: string;
  message: string;
  time: string;
  actionable: boolean;
}

const mockNotifications: Notification[] = [
  { id: 1, type: "follow", user: "Ana García", username: "@anagarcia", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", userId: "user-1", message: "comenzó a seguirte", time: "Hace 2 min", actionable: true },
  { id: 2, type: "like", user: "Diego López", username: "@diegolopez", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop", userId: "user-2", message: "le gustó tu perfil", time: "Hace 15 min", actionable: false },
  { id: 3, type: "follow", user: "María Torres", username: "@mariatorres", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", userId: "user-3", message: "comenzó a seguirte", time: "Hace 1 hora", actionable: true },
  { id: 4, type: "comment", user: "Luis Hernández", username: "@luish", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop", userId: "user-4", message: "comentó en tu actividad", time: "Hace 3 horas", actionable: false },
  { id: 5, type: "recommendation", user: "Sofía Ramírez", username: "@sofiar", avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&fit=crop", userId: "user-5", message: "te recomendó 'Neón 2099'", time: "Hace 5 horas", actionable: false },
];

const typeConfig: Record<NotifType, { icon: React.ElementType; color: string }> = {
  follow: { icon: UserPlus, color: "text-primary" },
  like: { icon: Heart, color: "text-destructive" },
  comment: { icon: MessageCircle, color: "text-accent" },
  recommendation: { icon: Film, color: "text-primary" },
};

const ProfileRequestsContent = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);

  const handleAccept = (id: number) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, actionable: false, message: "ahora te sigue · seguiste de vuelta" } : n));
  };

  const handleDismiss = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-secondary/80 flex items-center justify-center mx-auto mb-3">
          <UserPlus className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium">Sin solicitudes</p>
        <p className="text-xs text-muted-foreground mt-1">Aquí aparecerán tus notificaciones y solicitudes</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notif, i) => {
        const config = typeConfig[notif.type];
        const Icon = config.icon;
        return (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-card/60 backdrop-blur-sm hover:border-border/60 transition-all"
          >
            <img
              src={notif.avatar}
              alt={notif.user}
              className="w-10 h-10 rounded-full object-cover border-2 border-border cursor-pointer"
              onClick={() => navigate(`/user/${notif.userId}`)}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-semibold cursor-pointer hover:underline" onClick={() => navigate(`/user/${notif.userId}`)}>{notif.user}</span>{" "}
                <span className="text-muted-foreground">{notif.message}</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{notif.time}</p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-secondary/50`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            {notif.actionable && (
              <div className="flex gap-1 shrink-0">
                <Button size="sm" className="h-7 px-2.5 text-xs gap-1" onClick={() => handleAccept(notif.id)}>
                  <Check className="w-3 h-3" /> Seguir
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => handleDismiss(notif.id)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProfileRequestsContent;
