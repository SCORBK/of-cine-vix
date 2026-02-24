import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, AlertTriangle, Ban, Eye, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatReport {
  id: number;
  participants: { name: string; avatar: string }[];
  flaggedMessage: string;
  reason: string;
  date: string;
  status: "pending" | "reviewed" | "blocked";
}

const mockChatReports: ChatReport[] = [
  {
    id: 1,
    participants: [
      { name: "Carlos Méndez", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop" },
      { name: "Ana García", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop" },
    ],
    flaggedMessage: "Este mensaje contiene contenido inapropiado...",
    reason: "Contenido ofensivo",
    date: "Hace 30 min",
    status: "pending",
  },
  {
    id: 2,
    participants: [
      { name: "Diego López", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=60&h=60&fit=crop" },
      { name: "María Torres", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop" },
    ],
    flaggedMessage: "Spam repetitivo detectado en la conversación",
    reason: "Spam",
    date: "Hace 2 horas",
    status: "reviewed",
  },
  {
    id: 3,
    participants: [
      { name: "Luis Hernández", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop" },
      { name: "Sofía Ramírez", avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=60&h=60&fit=crop" },
    ],
    flaggedMessage: "Envío de enlaces sospechosos",
    reason: "Enlaces maliciosos",
    date: "Hace 1 día",
    status: "blocked",
  },
];

const statusStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending: { label: "Pendiente", bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
  reviewed: { label: "Revisado", bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  blocked: { label: "Bloqueado", bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
};

const AdminChatsTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState(mockChatReports);

  const filtered = searchQuery.trim()
    ? reports.filter((r) => r.participants.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())) || r.flaggedMessage.toLowerCase().includes(searchQuery.toLowerCase()))
    : reports;

  const handleBlock = (id: number) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "blocked" as const } : r));
  };

  const handleReview = (id: number) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "reviewed" as const } : r));
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Pendientes", count: reports.filter((r) => r.status === "pending").length, icon: AlertTriangle, color: "accent" },
          { label: "Revisados", count: reports.filter((r) => r.status === "reviewed").length, icon: Shield, color: "primary" },
          { label: "Bloqueados", count: reports.filter((r) => r.status === "blocked").length, icon: Ban, color: "destructive" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl border border-${item.color}/20 bg-${item.color}/10 p-4 flex items-center gap-3`}
            >
              <Icon className={`w-5 h-5 text-${item.color}`} />
              <div>
                <p className={`text-xl font-bold text-${item.color}`}>{item.count}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar en chats reportados..." className="pl-10 bg-secondary/50 border-border/50" />
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {filtered.map((report, i) => {
          const style = statusStyles[report.status];
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden"
            >
              <div className="px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex -space-x-2">
                    {report.participants.map((p, j) => (
                      <img key={j} src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover border-2 border-card" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{report.participants.map((p) => p.name).join(" y ")}</p>
                    <p className="text-[10px] text-muted-foreground">{report.date}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${style.bg} ${style.text} border ${style.border}`}>
                    {style.label}
                  </span>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3 mb-2">
                  <p className="text-sm text-foreground/80 italic">"{report.flaggedMessage}"</p>
                </div>
                <p className="text-xs text-muted-foreground">Motivo: {report.reason}</p>
              </div>

              <div className="px-5 py-3 border-t border-border/30 flex items-center gap-2">
                {report.status !== "reviewed" && (
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-primary" onClick={() => handleReview(report.id)}>
                    <Eye className="w-3 h-3" /> Marcar revisado
                  </Button>
                )}
                {report.status !== "blocked" && (
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-destructive" onClick={() => handleBlock(report.id)}>
                    <Ban className="w-3 h-3" /> Bloquear cuenta
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-primary ml-auto">
                  <MessageCircle className="w-3 h-3" /> Ver chat completo
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminChatsTab;
