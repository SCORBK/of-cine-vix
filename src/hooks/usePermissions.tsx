import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const usePermissions = () => {
  const { roles, isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (isAdmin) {
        // Admin has all permissions
        setPermissions([
          "manage_movies", "manage_reports", "manage_chats", "manage_users",
          "manage_roles", "manage_customize", "manage_avatars", "manage_covers", "manage_followers"
        ]);
        setLoading(false);
        return;
      }
      if (roles.length === 0) { setPermissions([]); setLoading(false); return; }
      
      const { data } = await supabase
        .from("role_permissions")
        .select("permission, role")
        .in("role", roles as any);
      
      const perms = [...new Set((data || []).map((p: any) => p.permission))];
      setPermissions(perms);
      setLoading(false);
    };
    fetch();
  }, [roles, isAdmin]);

  const hasPermission = (perm: string) => isAdmin || permissions.includes(perm);

  return { permissions, hasPermission, loading };
};
