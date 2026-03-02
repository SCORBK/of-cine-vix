import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const AdminChatsTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      const userIds = [...new Set(data.flatMap((m: any) => [m.sender_id, m.receiver_id]))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      setMessages(data.map((m: any) => ({
        ...m,
        sender: profileMap.get(m.sender_id),
        receiver: profileMap.get(m.receiver_id),
      })));
    } else {
      setMessages([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const filtered = searchQuery.trim()
    ? messages.filter((m) =>
        m.sender?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.receiver?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.message?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{messages.length}</p>
          <p className="text-sm text-muted-foreground">Mensajes recientes</p>
        </div>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar en mensajes..." className="pl-10 bg-secondary/50 border-border/50" />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/60 p-8 text-center">
          <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay mensajes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((msg, i) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="flex items-start gap-3 px-4 py-3 rounded-xl border border-border/30 bg-card/60"
            >
              <img
                src={msg.sender?.avatar_url || `https://ui-avatars.com/api/?name=${msg.sender?.display_name || "U"}&background=random`}
                alt="" className="w-8 h-8 rounded-full object-cover mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-foreground">{msg.sender?.display_name || "Usuario"}</p>
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <p className="text-xs font-medium text-foreground">{msg.receiver?.display_name || "Usuario"}</p>
                  <span className="text-[10px] text-muted-foreground ml-auto">{new Date(msg.created_at).toLocaleString("es-MX")}</span>
                </div>
                <p className="text-sm text-foreground/80 mt-1 truncate">{msg.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminChatsTab;
