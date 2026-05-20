import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { systemSettingsService, SystemSettings } from "@/services";
import { companyService, CompanySettings } from "@/services";

export const useSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>(systemSettingsService.getSettings());
  const [companySettings, setCompanySettings] = useState<CompanySettings>({});

  useEffect(() => {
    if (user?.company_id) {
      const company = companyService.getById(user.company_id, undefined, true);
      if (company?.settings) {
        setCompanySettings(company.settings);
      }
    }
  }, [user]);

  const updateSection = useCallback((section: keyof SystemSettings, data: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  }, []);

  const saveSystemSettings = useCallback(() => {
    systemSettingsService.updateSettings(settings);
    toast({
      title: "Configurações salvas",
      description: "Suas alterações foram salvas com sucesso."
    });
  }, [settings, toast]);

  const saveCompanySettings = useCallback(() => {
    if (user?.company_id) {
      const updatedSettings = {
        ...companySettings,
        primary_color: settings.branding.primaryColor,
        is_dark_mode_forced: settings.branding.darkMode,
      };
      
      companyService.updateSettings(user.company_id, updatedSettings);
      toast({
        title: "Empresa atualizada",
        description: "As configurações do seu tenant foram salvas."
      });
    }
  }, [user?.company_id, companySettings, settings.branding.primaryColor, settings.branding.darkMode, toast]);

  return {
    settings,
    companySettings,
    setCompanySettings,
    updateSection,
    saveSystemSettings,
    saveCompanySettings,
    user
  };
};
