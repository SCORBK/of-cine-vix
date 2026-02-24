import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, ArrowLeft, Search, MoreVertical, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatPreview {
  id: string;
  name: string;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  streak: number;
}

interface ChatMessage {
  id: number;
  text: string;
  fromMe: boolean;
  time: string;
}

const mockChats: ChatPreview[] = [
  { id: "chat-1", name: "Ana García", username: "@anagarcia", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", lastMessage: "¿Ya viste Neón 2099? 🔥", time: "Hace 5 min", unread: 2, streak: 15 },
  { id: "chat-2", name: "Diego López", username: "@diegolopez", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop", lastMessage: "Gracias por la recomendación!", time: "Hace 1 hora", unread: 0, streak: 7 },
  { id: "chat-3", name: "María Torres", username: "@mariatorres", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", lastMessage: "Jajaja estuvo buenísima", time: "Hace 3 horas", unread: 0, streak: 3 },
  { id: "chat-4", name: "Luis Hernández", username: "@luish", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop", lastMessage: "¿Cuál me recomiendas?", time: "Ayer", unread: 1, streak: 0 },
];

const mockMessages: Record<string, ChatMessage[]> = {
  "chat-1": [
    { id: 1, text: "Hola! 👋", fromMe: false, time: "10:30" },
    { id: 2, text: "Hey Ana! ¿Qué tal?", fromMe: true, time: "10:31" },
    { id: 3, text: "¿Ya viste Neón 2099?", fromMe: false, time: "10:32" },
    { id: 4, text: "Es increíble! 🔥", fromMe: false, time: "10:32" },
    { id: 5, text: "No todavía! La tengo en mi lista", fromMe: true, time: "10:35" },
  ],
  "chat-2": [
    { id: 1, text: "Vi El Bosque Maldito por tu recomendación", fromMe: false, time: "09:00" },
    { id: 2, text: "¿Te gustó?", fromMe: true, time: "09:05" },
    { id: 3, text: "Gracias por la recomendación!", fromMe: false, time: "09:10" },
  ],
};

function StreakBadge({ streak, size = "sm" }: { streak: number; size?: "sm" | "md" }) {
  if (streak <= 0) return null;
  const isSm = size === "sm";
  return (
    <div className={`flex items-center gap-0.5 ${isSm ? "px-1.5 py-0.5" : "px-2 py-1"} rounded-full bg-orange-500/15 border border-orange-500/20`}>
      <Flame className={`${isSm ? "w-3 h-3" : "w-3.5 h-3.5"} text-orange-400`} />
      <span className={`${isSm ? "text-[10px]" : "text-xs"} font-bold text-orange-400`}>{streak}</span>
    </div>
  );
}

const ProfileChatsContent = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const filteredChats = searchQuery.trim()
    ? mockChats.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : mockChats;

  const currentChat = mockChats.find((c) => c.id === activeChat);
  const currentMessages = activeChat ? (messages[activeChat] || []) : [];

  const handleSend = () => {
    if (!newMessage.trim() || !activeChat) return;
    const msg: ChatMessage = { id: Date.now(), text: newMessage, fromMe: true, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), msg] }));
    setNewMessage("");
  };

  // Chat detail view
  if (activeChat && currentChat) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col"
        style={{ height: "min(520px, 70vh)" }}
      >
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 shrink-0">
          <button onClick={() => setActiveChat(null)} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img src={currentChat.avatar} alt={currentChat.name} className="w-9 h-9 rounded-full object-cover border border-border" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{currentChat.name}</p>
              <StreakBadge streak={currentChat.streak} size="sm" />
            </div>
            <p className="text-[10px] text-muted-foreground">{currentChat.username}</p>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                msg.fromMe
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-foreground rounded-bl-md"
              }`}>
                <p>{msg.text}</p>
                <p className={`text-[9px] mt-1 ${msg.fromMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border/30 flex items-center gap-2 shrink-0">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe un mensaje..."
            className="bg-secondary/50 border-border/50"
          />
          <Button size="sm" onClick={handleSend} disabled={!newMessage.trim()} className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Chat list view
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar chats..."
          className="pl-10 bg-secondary/50 border-border/50"
        />
      </div>

      {filteredChats.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 text-center">
          <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No tienes chats aún</p>
        </div>
      ) : (
        filteredChats.map((chat, i) => (
          <motion.button
            key={chat.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setActiveChat(chat.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all text-left"
          >
            <div className="relative">
              <img src={chat.avatar} alt={chat.name} className="w-11 h-11 rounded-full object-cover border-2 border-border" />
              {chat.unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {chat.unread}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{chat.name}</p>
                  <StreakBadge streak={chat.streak} />
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{chat.time}</span>
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
