import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { systemSettingsService, SystemSettings } from "@/services";
import { companyService, CompanySettings } from "@/services";

export const useSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>(() => systemSettingsService.getSettings());
  const [companySettings, setCompanySettings] = useState<CompanySettings>({});
  const [tenantBranding, setTenantBranding] = useState<Partial<Company>>({});


  useEffect(() => {
    if (user?.company_id) {
      companyService.getById(user.company_id, undefined, true).then(company => {
        if (company) {
          if (company.settings) {
            setCompanySettings(company.settings);
          }
          setTenantBranding({
            subdomain: company.subdomain,
            custom_domain: company.custom_domain,
            brand_name: company.brand_name,
            logo_url: company.logo_url,
            favicon_url: company.favicon_url,
            theme_settings: company.theme_settings
          });
        }
      });
    }
  }, [user]);

  const updateSection = useCallback(<T extends keyof SystemSettings>(section: T, data: Partial<SystemSettings[T]>) => {
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

  const saveCompanySettings = useCallback(async () => {
    if (user?.company_id) {
      const updatedSettings = {
        ...companySettings,
        primary_color: settings.branding.primaryColor,
        is_dark_mode_forced: settings.branding.darkMode,
      };
      
      await companyService.updateSettings(user.company_id, updatedSettings);
      await companyService.updateTenantBranding(user.company_id, tenantBranding);
      
      toast({
        title: "Empresa atualizada",
        description: "As configurações do seu tenant foram salvas."
      });
    }
  }, [user?.company_id, companySettings, tenantBranding, settings.branding.primaryColor, settings.branding.darkMode, toast]);

  return {
    settings,
    companySettings,
    setCompanySettings,
    tenantBranding,
    setTenantBranding,
    updateSection,
    saveSystemSettings,
    saveCompanySettings,
    user
  };
};
