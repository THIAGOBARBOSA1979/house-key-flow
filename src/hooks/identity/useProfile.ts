import { Supabase } from "@/integrations/supabase";

export const useProfile = () => {
  const updateProfile = async (data: any) => {
    const user = await Supabase.auth.getCurrentUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data: updated, error } = await Supabase.db.update('profiles', user.id, data);
    
    if (error) throw error;
    return updated;
  };
  return { updateProfile };
};

