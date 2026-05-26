import { useAuth } from "@/contexts/AuthContext";
import { Permission } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePermission = () => {
  const { user } = useAuth();

  const { data: userPermissions = [], isLoading } = useQuery({
    queryKey: ['permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      if (user.is_super_admin) return ['*'];

      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          permissions (
            name
          )
        `)
        .eq('role', user.role);

      if (error) throw error;
      return (data as any[]).map((rp: any) => rp.permissions.name);
    },
    enabled: !!user,
  });

  const hasPermission = (permission: string) => {
    if (user?.is_super_admin) return true;
    return userPermissions.includes(permission) || userPermissions.includes('*');
  };

  return { hasPermission, isLoading, permissions: userPermissions };
};
