import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ChevronLeft, AlertTriangle, Bug, HelpCircle, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type SupportView = "menu" | "chat" | "tickets";
type TicketCategory = "bug" | "issue" | "question";

const categories: { key: TicketCategory; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "bug", label: "Reportar Bug", icon: Bug, desc: "Algo no funciona correctamente" },
  { key: "issue", label: "Problema General", icon: AlertTriangle, desc: "Problemas con tu cuenta o contenido" },
  { key: "question", label: "Pregunta", icon: HelpCircle, desc: "Necesitas ayuda o información" },
];

const roleConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  admin: { label: "Admin", icon: Shield, color: "text-primary" },
  support: { label: "Soporte", icon: ShieldCheck, color: "text-accent" },
  moderator: { label: "Moderador", icon: ShieldAlert, color: "text-blue-400" },
};

const SupportChat = () => {
  const { user, isAdmin, hasRole } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<SupportView>("menu");
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [message, setMessage] = useState("");
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [senderRoles, setSenderRoles] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const isStaff = isAdmin || hasRole("support") || hasRole("moderator");

  useEffect(() => {
    if (!user || !isOpen) return;
    fetchMyTickets();
  }, [user, isOpen]);

  const fetchMyTickets = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("reports")
      .select("*")
      .eq("reporter_id", user.id)
      .neq("status", "resolved")
      .order("created_at", { ascending: false });
    setMyTickets(data || []);
  };

  const fetchSenderRoles = async (msgs: any[]) => {
    const senderIds = [...new Set(msgs.map(m => m.sender_id).filter(id => id !== user?.id))];
    if (senderIds.length === 0) return;
    const { data } = await supabase.from("user_roles").select("user_id, role").in("user_id", senderIds);
    const map: Record<string, string> = {};
    (data || []).forEach((r: any) => { 
      // Keep highest role: admin > support > moderator
      if (!map[r.user_id] || r.role === "admin" || (r.role === "support" && map[r.user_id] === "moderator")) {
        map[r.user_id] = r.role;
      }
    });
    setSenderRoles(prev => ({ ...prev, ...map }));
  };

  const handleSelectCategory = (cat: TicketCategory) => {
    setSelectedCategory(cat);
    setView("chat");
    setMessages([]);
    setActiveReportId(null);
  };

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    const text = message.trim();
    setMessage("");

    let reportId = activeReportId;
    if (!reportId && selectedCategory) {
      const { data: report, error } = await supabase
        .from("reports")
        .insert({ reporter_id: user.id, category: selectedCategory, message: text })
        .select().single();
      if (error || !report) {
        toast({ title: "Error", description: "No se pudo crear el ticket", variant: "destructive" });
        return;
      }
      reportId = report.id;
      setActiveReportId(reportId);
    }
    if (!reportId) return;

    const { data: msg } = await supabase
      .from("support_messages")
      .insert({ report_id: reportId, sender_id: user.id, message: text })
      .select().single();
    if (msg) {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const openTicketChat = async (report: any) => {
    setActiveReportId(report.id);
    setSelectedCategory(report.category);
    setView("chat");

    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .eq("report_id", report.id)
      .order("created_at", { ascending: true });
    const msgs = data || [];
    setMessages(msgs);
    fetchSenderRoles(msgs);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // Realtime
  useEffect(() => {
    if (!activeReportId || !user) return;
    const channel = supabase
      .channel(`support-${activeReportId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "support_messages",
        filter: `report_id=eq.${activeReportId}`,
      }, (payload) => {
        const msg = payload.new as any;
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        if (msg.sender_id !== user.id) {
          fetchSenderRoles([msg]);
        }
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeReportId, user]);

  const handleBack = () => {
    setView("menu");
    setSelectedCategory(null);
    setMessages([]);
    setActiveReportId(null);
    fetchMyTickets();
  };

  // Don't show widget for staff (they use admin panel)
  if (!user) return null;

  return (
    <>
      <motion.button onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X className="w-6 h-6" /></motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
              {myTickets.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {myTickets.length}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[340px] max-h-[480px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-card">
              {view !== "menu" && (
                <button onClick={handleBack} className="p-1 rounded-lg hover:bg-secondary transition-colors"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
              )}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {view === "menu" ? "Soporte" : "Chat de Soporte"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {view === "menu" ? "¿En qué podemos ayudarte?" : categories.find(c => c.key === selectedCategory)?.label}
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-accent" title="En línea" />
            </div>

            {view === "menu" && (
              <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                {myTickets.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tickets Abiertos</p>
                    {myTickets.map((t) => (
                      <button key={t.id} onClick={() => openTicketChat(t)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <MessageCircle className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{t.category} — {t.message?.slice(0, 30)}...</p>
                          <p className="text-[10px] text-muted-foreground">{t.status === "in_progress" ? "En proceso" : "Pendiente"}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!isStaff && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nuevo Ticket</p>
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button key={cat.key} onClick={() => handleSelectCategory(cat.key)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30 transition-all text-left"
                        >
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-primary" /></div>
                          <div><p className="text-sm font-medium text-foreground">{cat.label}</p><p className="text-xs text-muted-foreground">{cat.desc}</p></div>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {view === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]">
                  {messages.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-xs text-muted-foreground">Describe tu {selectedCategory === "bug" ? "bug" : selectedCategory === "issue" ? "problema" : "pregunta"} y te ayudaremos.</p>
                    </div>
                  )}
                  {messages.map((msg) => {
                    const isMine = msg.sender_id === user?.id;
                    const role = senderRoles[msg.sender_id];
                    const rc = role ? roleConfig[role] : null;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"
                        }`}>
                          {!isMine && rc && (
                            <div className={`flex items-center gap-1 mb-1 ${rc.color}`}>
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
                {/* Only users (non-staff) can send from this widget, staff uses admin panel */}
                {!isStaff ? (
                  <div className="p-3 border-t border-border flex items-center gap-2">
                    <Input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Escribe tu mensaje..." className="flex-1 bg-secondary/40 border-border/50 text-sm h-9" maxLength={500} />
                    <Button onClick={handleSend} disabled={!message.trim()} size="icon" className="h-9 w-9 shrink-0"><Send className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <div className="p-3 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">Responde desde el panel de administración → Reportes</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportChat;
