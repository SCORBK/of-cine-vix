import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ChevronLeft, AlertTriangle, Bug, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SupportView = "menu" | "chat";
type TicketCategory = "bug" | "issue" | "question";

interface MockMessage {
  id: number;
  text: string;
  sender: "user" | "support";
  time: string;
}

const categories: { key: TicketCategory; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "bug", label: "Reportar Bug", icon: Bug, desc: "Algo no funciona correctamente" },
  { key: "issue", label: "Problema General", icon: AlertTriangle, desc: "Problemas con tu cuenta o contenido" },
  { key: "question", label: "Pregunta", icon: HelpCircle, desc: "Necesitas ayuda o información" },
];

const SupportChat = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<SupportView>("menu");
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MockMessage[]>([]);
  const [ticketSent, setTicketSent] = useState(false);

  const handleSelectCategory = (cat: TicketCategory) => {
    setSelectedCategory(cat);
    setView("chat");
    setMessages([
      {
        id: 1,
        text: `¡Hola! Cuéntanos sobre tu ${cat === "bug" ? "bug" : cat === "issue" ? "problema" : "pregunta"} y te ayudaremos lo antes posible.`,
        sender: "support",
        time: "Ahora",
      },
    ]);
    setTicketSent(false);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    const newMsg: MockMessage = {
      id: messages.length + 1,
      text: message,
      sender: "user",
      time: "Ahora",
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage("");

    if (!ticketSent) {
      setTicketSent(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "Tu ticket ha sido recibido. Un moderador lo revisará pronto. Te notificaremos cuando haya una respuesta.",
            sender: "support",
            time: "Ahora",
          },
        ]);
      }, 1000);
    }
  };

  const handleBack = () => {
    setView("menu");
    setSelectedCategory(null);
    setMessages([]);
    setTicketSent(false);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[340px] max-h-[480px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-card">
              {view === "chat" && (
                <button onClick={handleBack} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {view === "menu" ? "Soporte" : "Chat de Soporte"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {view === "menu" ? "¿En qué podemos ayudarte?" : categories.find((c) => c.key === selectedCategory)?.label}
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-accent" title="En línea" />
              <button
                onClick={() => { setIsOpen(false); navigate("/dev-profile"); }}
                className="w-7 h-7 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform"
                title="Ver perfil de Velora"
              >
                <span className="text-[10px] font-bold text-primary-foreground">V</span>
              </button>
            </div>

            {/* Menu view */}
            {view === "menu" && (
              <div className="p-4 space-y-2 flex-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => handleSelectCategory(cat.key)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">{cat.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Chat view */}
            {view === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-secondary text-foreground rounded-bl-md"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border flex items-center gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 bg-secondary/40 border-border/50 text-sm h-9"
                    maxLength={500}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    size="icon"
                    className="h-9 w-9 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportChat;
