import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, ArrowLeft, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ChatPartner {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

const ProfileChatsContent = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPartner[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchChats();
  }, [user]);

  const fetchChats = async () => {
    if (!user) return;
    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!msgs || msgs.length === 0) { setChats([]); return; }

    const partnersMap = new Map<string, { lastMessage: string; lastTime: string; unread: number }>();
    msgs.forEach((m: any) => {
      const partnerId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      if (!partnersMap.has(partnerId)) {
        partnersMap.set(partnerId, {
          lastMessage: m.message,
          lastTime: m.created_at,
          unread: m.sender_id !== user.id && !m.read ? 1 : 0,
        });
      } else if (m.sender_id !== user.id && !m.read) {
        const existing = partnersMap.get(partnerId)!;
        existing.unread++;
      }
    });

    const partnerIds = [...partnersMap.keys()];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username, avatar_url").in("user_id", partnerIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    setChats(partnerIds.map(id => ({
      ...profileMap.get(id) || { user_id: id, display_name: null, username: null, avatar_url: null },
      ...partnersMap.get(id)!,
    })));
  };

  const openChat = async (partnerId: string) => {
    if (!user) return;
    setActiveChat(partnerId);
    const partner = chats.find(c => c.user_id === partnerId);
    setPartnerProfile(partner);

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true });
    setMessages(data || []);

    // Mark as read
    await supabase.from("chat_messages").update({ read: true } as any).eq("sender_id", partnerId).eq("receiver_id", user.id).eq("read", false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !activeChat) return;
    const { data } = await supabase.from("chat_messages").insert({
      sender_id: user.id,
      receiver_id: activeChat,
      message: newMessage.trim(),
    }).select().single();
    if (data) setMessages(prev => [...prev, data]);
    setNewMessage("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // Realtime
  useEffect(() => {
    if (!user || !activeChat) return;
    const channel = supabase.channel(`chat-${activeChat}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const msg = payload.new as any;
        if ((msg.sender_id === activeChat && msg.receiver_id === user.id) ||
            (msg.sender_id === user.id && msg.receiver_id === activeChat)) {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, activeChat]);

  const filteredChats = searchQuery.trim()
    ? chats.filter(c => c.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.username?.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats;

  if (activeChat && partnerProfile) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col"
        style={{ height: "min(520px, 70vh)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 shrink-0">
          <button onClick={() => { setActiveChat(null); fetchChats(); }} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground"><ArrowLeft className="w-4 h-4" /></button>
          {partnerProfile.avatar_url ? (
            <img src={partnerProfile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"><User className="w-4 h-4 text-muted-foreground" /></div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{partnerProfile.display_name || "Usuario"}</p>
            <p className="text-[10px] text-muted-foreground">@{partnerProfile.username || "usuario"}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                msg.sender_id === user?.id ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"
              }`}>
                <p>{msg.message}</p>
                <p className={`text-[9px] mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="px-4 py-3 border-t border-border/30 flex items-center gap-2 shrink-0">
          <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Escribe un mensaje..." className="bg-secondary/50 border-border/50" />
          <Button size="sm" onClick={handleSend} disabled={!newMessage.trim()} className="shrink-0"><Send className="w-4 h-4" /></Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar chats..." className="pl-10 bg-secondary/50 border-border/50" />
      </div>
      {filteredChats.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 text-center">
          <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No tienes chats aún</p>
        </div>
      ) : (
        filteredChats.map((chat, i) => (
          <motion.button key={chat.user_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => openChat(chat.user_id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-card/60 hover:border-primary/30 transition-all text-left"
          >
            <div className="relative">
              {chat.avatar_url ? (
                <img src={chat.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-border" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center border-2 border-border"><User className="w-5 h-5 text-muted-foreground" /></div>
              )}
              {chat.unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{chat.unread}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground truncate">{chat.display_name || "Usuario"}</p>
                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{new Date(chat.lastTime).toLocaleDateString("es-MX")}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.lastMessage}</p>
            </div>
          </motion.button>
        ))
      )}
    </div>
  );
};

export default ProfileChatsContent;
