import { useState, useEffect } from 'react';
import { Supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { errorHandler } from '@/utils/errors/ErrorHandler';

export interface UserPreferences {
  sidebarCollapsed?: boolean;
  activeProfileId?: string;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPreferences({});
      setIsLoading(false);
      return;
    }

    const loadPreferences = async () => {
      try {
        const { data, error } = await Supabase.db.findOne<any>('user_preferences', user.id, 'user_id');
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data && data.preferences) {
          setPreferences(data.preferences as UserPreferences);
        } else {
          const defaultPrefs: UserPreferences = {
            sidebarCollapsed: false,
            theme: 'light'
          };
          setPreferences(defaultPrefs);
          Supabase.db.create('user_preferences', {
            user_id: user.id,
            preferences: defaultPrefs
          }).catch(console.error);
        }
      } catch (err) {
        errorHandler.handle(err, 'useUserPreferences:load');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id]);

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (!user) return;

    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);

    try {
      const { error } = await Supabase.db.update('user_preferences', user.id, {
        preferences: updated
      }, 'user_id');
      
      if (error) throw error;
    } catch (err) {
      errorHandler.handle(err, 'useUserPreferences:update');
    }
  };

  return {
    preferences,
    isLoading,
    updatePreferences,
    sidebarCollapsed: preferences.sidebarCollapsed || false,
    setSidebarCollapsed: (collapsed: boolean) => updatePreferences({ sidebarCollapsed: collapsed }),
    activeProfileId: preferences.activeProfileId,
    setActiveProfileId: (id: string) => updatePreferences({ activeProfileId: id })
  };
};
