import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldCheck, ShieldAlert, Search, Plus, Trash2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AVAILABLE_PERMISSIONS = [
  { key: "manage_movies", label: "Gestionar películas" },
  { key: "manage_reports", label: "Gestionar reportes" },
  { key: "manage_chats", label: "Ver chats" },
  { key: "manage_users", label: "Gestionar usuarios" },
  { key: "manage_roles", label: "Gestionar roles" },
  { key: "manage_customize", label: "Personalización" },
  { key: "manage_avatars", label: "Gestionar fotos de perfil" },
  { key: "manage_covers", label: "Gestionar portadas" },
  { key: "manage_followers", label: "Gestionar seguidores" },
];

const ROLES = [
  { key: "admin", label: "Administrador", icon: Shield, description: "Acceso total al sistema" },
  { key: "support", label: "Soporte", icon: ShieldCheck, description: "Atención a usuarios y reportes" },
  { key: "moderator", label: "Moderador", icon: ShieldAlert, description: "Moderación de contenido" },
] as const;

const AdminRolesTab = () => {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Record<string, string[]>>({
    admin: AVAILABLE_PERMISSIONS.map((p) => p.key),
    support: ["manage_reports", "manage_chats"],
    moderator: ["manage_movies", "manage_reports", "manage_users"],
  });
  const [userEmail, setUserEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("support");
  const [roleUsers, setRoleUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoleUsers = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("id, user_id, role, created_at");
    if (data) {
      // Fetch profiles for these users
      const userIds = [...new Set(data.map((r: any) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url")
        .in("user_id", userIds);
      
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      setRoleUsers(data.map((r: any) => ({ ...r, profile: profileMap.get(r.user_id) })));
    }
  };

  useEffect(() => {
    fetchRoleUsers();
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    const { data } = await supabase.from("role_permissions").select("role, permission");
    if (data && data.length > 0) {
      const grouped: Record<string, string[]> = { admin: [], support: [], moderator: [] };
      data.forEach((p: any) => {
        if (grouped[p.role]) grouped[p.role].push(p.permission);
      });
      setPermissions(grouped);
    }
  };

  const togglePermission = async (role: string, permission: string) => {
    if (role === "admin") return; // Admin always has all
    const current = permissions[role] || [];
    const has = current.includes(permission);
    
    if (has) {
      await supabase.from("role_permissions").delete().eq("role", role as any).eq("permission", permission);
      setPermissions((p) => ({ ...p, [role]: current.filter((k) => k !== permission) }));
    } else {
      await supabase.from("role_permissions").insert({ role: role as any, permission } as any);
      setPermissions((p) => ({ ...p, [role]: [...current, permission] }));
    }
  };

  const assignRole = async () => {
    if (!userEmail.trim()) return;
    setLoading(true);
    
    // Find user by email via profiles
    const { data: users } = await supabase
      .from("profiles")
      .select("user_id")
      .or(`username.eq.${userEmail.trim()}`);
    
    // Try by auth email - we need to search differently
    // Since we can't query auth.users directly, we'll use the edge approach
    // For now, let's try to find by username
    let userId: string | null = null;
    if (users && users.length > 0) {
      userId = users[0].user_id;
    }

    if (!userId) {
      toast({ title: "Usuario no encontrado", description: "Ingresa un nombre de usuario válido", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: selectedRole as any });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rol asignado", description: `Se asignó el rol de ${selectedRole} correctamente` });
      setUserEmail("");
      fetchRoleUsers();
    }
    setLoading(false);
  };

  const removeRole = async (id: string) => {
    await supabase.from("user_roles").delete().eq("id", id);
    fetchRoleUsers();
    toast({ title: "Rol eliminado" });
  };

  return (
    <div className="space-y-8">
      {/* Assign role */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5"
      >
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Asignar Rol
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Nombre de usuario (ej: user_abc123)"
            className="bg-secondary/50 border-border/50 flex-1"
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 rounded-lg bg-secondary/50 border border-border/50 text-foreground text-sm"
          >
            <option value="support">Soporte</option>
            <option value="moderator">Moderador</option>
          </select>
          <Button onClick={assignRole} disabled={loading} className="gap-2">
            <Plus className="w-4 h-4" /> Asignar
          </Button>
        </div>
      </motion.div>

      {/* Current role users */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5"
      >
        <h3 className="text-base font-semibold text-foreground mb-4">Usuarios con Roles</h3>
        {roleUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay usuarios con roles asignados</p>
        ) : (
          <div className="space-y-2">
            {roleUsers.map((ru: any) => (
              <div key={ru.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/30 border border-border/30">
                <img
                  src={ru.profile?.avatar_url || `https://ui-avatars.com/api/?name=${ru.profile?.display_name || "U"}&background=random`}
                  alt="" className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{ru.profile?.display_name || "Usuario"}</p>
                  <p className="text-xs text-muted-foreground">@{ru.profile?.username || "desconocido"}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  ru.role === "admin" ? "bg-primary/10 text-primary" :
                  ru.role === "support" ? "bg-accent/10 text-accent" :
                  "bg-secondary text-foreground"
                }`}>
                  {ru.role === "admin" ? "Admin" : ru.role === "support" ? "Soporte" : "Moderador"}
                </span>
                {ru.role !== "admin" && (
                  <button onClick={() => removeRole(ru.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Permissions matrix */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5"
      >
        <h3 className="text-base font-semibold text-foreground mb-4">Permisos por Rol</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Permiso</th>
                {ROLES.map((r) => (
                  <th key={r.key} className="text-center py-2 px-3 text-muted-foreground font-medium">{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <tr key={perm.key} className="border-b border-border/20">
                  <td className="py-2.5 pr-4 text-foreground">{perm.label}</td>
                  {ROLES.map((r) => {
                    const has = (permissions[r.key] || []).includes(perm.key);
                    const isAdmin = r.key === "admin";
                    return (
                      <td key={r.key} className="text-center py-2.5 px-3">
                        <button
                          onClick={() => togglePermission(r.key, perm.key)}
                          disabled={isAdmin}
                          className={`w-6 h-6 rounded-md border transition-all mx-auto flex items-center justify-center ${
                            has
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-border/50 hover:border-primary/50"
                          } ${isAdmin ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {has && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminRolesTab;
