import { useAuth } from "@/contexts/AuthContext";
import { Permission } from "@/types/auth";
import { useQuery } from "@tanstack/react-query";
import { Supabase } from "@/integrations/supabase";

export const usePermission = () => {
  const { user } = useAuth();

  const { data: userPermissions = [], isLoading } = useQuery({
    queryKey: ['permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Super Admin tem todas as permissões
      if (user.is_super_admin) return ['*'];

      const { data, error } = await Supabase
        .from('role_permissions')
        .select(`
          permissions (
            name
          )
        `)
        .eq('role', user.role);

      if (error) throw error;
      return data.map((rp: any) => rp.permissions.name);
    },
    enabled: !!user,
  });

  const hasPermission = (permission: string) => {
    if (user?.is_super_admin) return true;
    return userPermissions.includes(permission) || userPermissions.includes('*');
  };

  return { hasPermission, isLoading, permissions: userPermissions };
};
