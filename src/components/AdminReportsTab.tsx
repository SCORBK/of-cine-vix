import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, AlertTriangle, MessageCircle, ArrowLeft, Send, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

type TicketStatus = "pending" | "in_progress" | "resolved";

const statusConfig: Record<TicketStatus, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  pending: { label: "Pendiente", icon: AlertTriangle, bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
  in_progress: { label: "En Proceso", icon: Clock, bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  resolved: { label: "Resuelto", icon: CheckCircle2, bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
};

const roleConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  admin: { label: "Admin", icon: Shield, color: "text-primary" },
  support: { label: "Soporte", icon: ShieldCheck, color: "text-accent" },
  moderator: { label: "Moderador", icon: ShieldAlert, color: "text-blue-400" },
};

const AdminReportsTab = () => {
  const { user, isAdmin, hasRole } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [senderRoles, setSenderRoles] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const myRole = isAdmin ? "admin" : hasRole("support") ? "support" : "moderator";

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((r: any) => r.reporter_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url, username").in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      setReports(data.map((r: any) => ({ ...r, reporter: profileMap.get(r.reporter_id) })));
    } else {
      setReports([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reports").update({ status }).eq("id", id);
    toast({ title: `Reporte marcado como ${status === "resolved" ? "resuelto" : status === "in_progress" ? "en proceso" : "pendiente"}` });
    fetchReports();
  };

  const fetchSenderRoles = async (msgs: any[]) => {
    const senderIds = [...new Set(msgs.map(m => m.sender_id))];
    if (senderIds.length === 0) return;
    const { data } = await supabase.from("user_roles").select("user_id, role").in("user_id", senderIds);
    const map: Record<string, string> = {};
    (data || []).forEach((r: any) => {
      if (!map[r.user_id] || r.role === "admin" || (r.role === "support" && map[r.user_id] === "moderator")) {
        map[r.user_id] = r.role;
      }
    });
    setSenderRoles(prev => ({ ...prev, ...map }));
  };

  const openChat = async (report: any) => {
    setActiveChat(report);
    if (report.status === "pending") {
      await supabase.from("reports").update({ status: "in_progress" }).eq("id", report.id);
    }
    const { data } = await supabase.from("support_messages").select("*").eq("report_id", report.id).order("created_at", { ascending: true });
    const msgs = data || [];
    setChatMessages(msgs);
    fetchSenderRoles(msgs);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !activeChat) return;
    const { data: msg } = await supabase
      .from("support_messages")
      .insert({ report_id: activeChat.id, sender_id: user.id, message: newMessage.trim() })
      .select().single();
    if (msg) {
      setChatMessages(prev => [...prev, msg]);
      setNewMessage("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const resolveAndDelete = async (reportId: string) => {
    await supabase.from("support_messages").delete().eq("report_id", reportId);
    await supabase.from("reports").delete().eq("id", reportId);
    toast({ title: "Reporte resuelto y eliminado" });
    setActiveChat(null);
    setChatMessages([]);
    fetchReports();
  };

  useEffect(() => {
    if (!activeChat) return;
    const channel = supabase
      .channel(`admin-support-${activeChat.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "support_messages",
        filter: `report_id=eq.${activeChat.id}`,
      }, (payload) => {
        const msg = payload.new as any;
        setChatMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        fetchSenderRoles([msg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeChat]);

  const counts = {
    pending: reports.filter(r => r.status === "pending").length,
    in_progress: reports.filter(r => r.status === "in_progress").length,
    resolved: reports.filter(r => r.status === "resolved").length,
  };

  if (activeChat) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col"
        style={{ height: "min(560px, 75vh)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 shrink-0">
          <button onClick={() => { setActiveChat(null); setChatMessages([]); fetchReports(); }} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img src={activeChat.reporter?.avatar_url || `https://ui-avatars.com/api/?name=U&background=random`}
            alt="" className="w-9 h-9 rounded-full object-cover border border-border" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{activeChat.reporter?.display_name || "Usuario"}</p>
            <p className="text-[10px] text-muted-foreground">{activeChat.category} · {new Date(activeChat.created_at).toLocaleDateString("es-MX")}</p>
          </div>
          <Button size="sm" variant="destructive" onClick={() => resolveAndDelete(activeChat.id)} className="text-xs gap-1">
            <CheckCircle2 className="w-3 h-3" /> Resolver
          </Button>
        </div>

        {activeChat.message && (
          <div className="px-4 py-2 bg-secondary/30 border-b border-border/20">
            <p className="text-xs text-muted-foreground">Mensaje inicial:</p>
            <p className="text-sm text-foreground">{activeChat.message}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No hay mensajes aún. Responde al usuario.</p>
            </div>
          )}
          {chatMessages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            const role = senderRoles[msg.sender_id];
            const rc = role ? roleConfig[role] : null;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                  isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"
                }`}>
                  {rc && (
                    <div className={`flex items-center gap-1 mb-1 ${isMine ? "text-primary-foreground/80" : rc.color}`}>
                      <rc.icon className="w-3 h-3" />
                      <span className="text-[10px] font-semibold">{rc.label}</span>
                    </div>
                  )}
                  <p>{msg.message}</p>
                  <p className={`text-[9px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 py-3 border-t border-border/30 flex items-center gap-2 shrink-0">
          {(() => {
            const RoleIcon = roleConfig[myRole]?.icon;
            return (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/50 text-xs shrink-0 ${roleConfig[myRole]?.color || "text-muted-foreground"}`}>
                {RoleIcon && <RoleIcon className="w-3 h-3" />}
                <span className="font-medium">{roleConfig[myRole]?.label}</span>
              </div>
            );
          })()}
          <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Responder al usuario..."
            className="bg-secondary/50 border-border/50 flex-1" />
          <Button size="sm" onClick={sendMessage} disabled={!newMessage.trim()} className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(["pending", "in_progress", "resolved"] as TicketStatus[]).map((s, i) => {
          const config = statusConfig[s];
          const Icon = config.icon;
          return (
            <motion.div key={s} custom={i} variants={fadeIn} initial="hidden" animate="visible"
              className={`rounded-xl border ${config.border} ${config.bg} p-4 flex items-center gap-3`}
            >
              <Icon className={`w-5 h-5 ${config.text}`} />
              <div>
                <p className={`text-xl font-bold ${config.text}`}>{counts[s]}</p>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Cargando reportes...</p>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/60 p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay reportes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, i) => {
            const status = (report.status as TicketStatus) || "pending";
            const config = statusConfig[status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <motion.div key={report.id} custom={i} variants={fadeIn} initial="hidden" animate="visible"
                className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden"
              >
                <div className="px-5 py-4 flex items-start gap-4">
                  <img src={report.reporter?.avatar_url || `https://ui-avatars.com/api/?name=U&background=random`}
                    alt="" className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-border" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{report.reporter?.display_name || "Usuario"}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.text} border ${config.border}`}>
                        <StatusIcon className="w-3 h-3" /> {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{report.category}</p>
                    {report.message && <p className="text-sm text-foreground/80 mt-2">{report.message}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(report.created_at).toLocaleString("es-MX")}</p>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-border/30 flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => openChat(report)} className="text-xs gap-1">
                    <MessageCircle className="w-3 h-3" /> Chatear
                  </Button>
                  {status !== "in_progress" && (
                    <Button variant="ghost" size="sm" onClick={() => updateStatus(report.id, "in_progress")} className="text-xs gap-1 text-muted-foreground hover:text-primary">
                      <Clock className="w-3 h-3" /> En Proceso
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => resolveAndDelete(report.id)} className="text-xs gap-1 text-muted-foreground hover:text-accent">
                    <CheckCircle2 className="w-3 h-3" /> Resolver y Eliminar
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminReportsTab;
