import { Supabase } from "@/integrations/supabase";

export const useProfile = () => {
  const updateProfile = async (data: any) => {
    const { data: updated, error } = await Supabase.db.from('profiles').update(data).eq('id', (await Supabase.auth.getUser()).data.user?.id);
    if (error) throw error;
    return updated;
  };
  return { updateProfile };
};
