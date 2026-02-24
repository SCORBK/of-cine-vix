import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, UserPlus, UserCheck, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MockUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: "none" | "pending" | "following";
}

const mockSearchUsers: MockUser[] = [
  { id: "user-1", name: "Ana García", username: "@anagarcia", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", status: "none" },
  { id: "user-2", name: "Diego López", username: "@diegolopez", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop", status: "following" },
  { id: "user-3", name: "María Torres", username: "@mariatorres", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", status: "none" },
  { id: "user-4", name: "Luis Hernández", username: "@luish", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop", status: "pending" },
  { id: "user-5", name: "Sofía Ramírez", username: "@sofiar", avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&fit=crop", status: "none" },
];

interface UserSearchModalProps {
  open: boolean;
  onClose: () => void;
}

const UserSearchModal = ({ open, onClose }: UserSearchModalProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState(mockSearchUsers);

  const filtered = query.trim()
    ? users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.username.toLowerCase().includes(query.toLowerCase()))
    : users;

  const handleFollow = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "none" ? "pending" : u.status === "pending" ? "none" : u.status }
          : u
      )
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-start justify-center pt-20 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Search header */}
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar usuarios..."
                    className="pl-10 bg-secondary/50 border-border/50"
                    autoFocus
                  />
                </div>
                <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="py-8 text-center">
                  <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
                </div>
              ) : (
                filtered.map((user, i) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/40 transition-colors cursor-pointer"
                    onClick={() => { navigate(`/user/${user.id}`); onClose(); }}
                  >
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-border" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.username}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={user.status === "following" ? "secondary" : user.status === "pending" ? "outline" : "default"}
                      className="text-xs gap-1 shrink-0"
                      onClick={(e) => { e.stopPropagation(); handleFollow(user.id); }}
                    >
                      {user.status === "none" && <><UserPlus className="w-3 h-3" /> Seguir</>}
                      {user.status === "pending" && <><Clock className="w-3 h-3" /> Pendiente</>}
                      {user.status === "following" && <><UserCheck className="w-3 h-3" /> Siguiendo</>}
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserSearchModal;
