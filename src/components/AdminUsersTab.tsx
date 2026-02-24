import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Ban, ShieldCheck, User, MoreVertical, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ManagedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  email: string;
  status: "active" | "warned" | "blocked";
  joinDate: string;
  reports: number;
}

const mockManagedUsers: ManagedUser[] = [
  { id: "u1", name: "Carlos Méndez", username: "@carlosm", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop", email: "carlos@email.com", status: "active", joinDate: "Ene 2024", reports: 0 },
  { id: "u2", name: "Ana García", username: "@anagarcia", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", email: "ana@email.com", status: "warned", joinDate: "Feb 2024", reports: 2 },
  { id: "u3", name: "Diego López", username: "@diegolopez", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop", email: "diego@email.com", status: "active", joinDate: "Mar 2024", reports: 0 },
  { id: "u4", name: "Laura Ruiz", username: "@lauraruiz", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", email: "laura@email.com", status: "blocked", joinDate: "Ene 2024", reports: 5 },
];

const statusStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
  active: { label: "Activo", bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
  warned: { label: "Advertido", bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  blocked: { label: "Bloqueado", bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
};

const AdminUsersTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState(mockManagedUsers);

  const filtered = searchQuery.trim()
    ? users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.username.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  const handleBlock = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "blocked" ? "active" as const : "blocked" as const } : u));
  };

  const handleWarn = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "warned" as const } : u));
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Activos", count: users.filter((u) => u.status === "active").length, icon: User, style: statusStyles.active },
          { label: "Advertidos", count: users.filter((u) => u.status === "warned").length, icon: ShieldCheck, style: statusStyles.warned },
          { label: "Bloqueados", count: users.filter((u) => u.status === "blocked").length, icon: Ban, style: statusStyles.blocked },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl border ${item.style.border} ${item.style.bg} p-4 flex items-center gap-3`}
            >
              <Icon className={`w-5 h-5 ${item.style.text}`} />
              <div>
                <p className={`text-xl font-bold ${item.style.text}`}>{item.count}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar usuarios..." className="pl-10 bg-secondary/50 border-border/50" />
      </div>

      {/* User list */}
      <div className="space-y-3">
        {filtered.map((user, i) => {
          const style = statusStyles[user.status];
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden"
            >
              <div className="px-5 py-4 flex items-center gap-4">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-border" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <span className="text-xs text-muted-foreground">{user.username}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${style.bg} ${style.text} border ${style.border}`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{user.email} · Desde {user.joinDate} · {user.reports} reportes</p>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-border/30 flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-primary">
                  <Eye className="w-3 h-3" /> Ver perfil
                </Button>
                {user.status !== "warned" && user.status !== "blocked" && (
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-primary" onClick={() => handleWarn(user.id)}>
                    <ShieldCheck className="w-3 h-3" /> Advertir
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-destructive ml-auto" onClick={() => handleBlock(user.id)}>
                  <Ban className="w-3 h-3" /> {user.status === "blocked" ? "Desbloquear" : "Bloquear"}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminUsersTab;
