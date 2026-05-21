import { Supabase } from '@/integrations/supabase';
import { errorHandler } from '@/utils/errors/ErrorHandler';

export interface SystemSettings {
  company: {
    name: string;
    cnpj: string;
    email: string;
    phone: string;
    address: string;
  };
  branding: {
    logoUrl?: string;
    primaryColor: string;
    darkMode: boolean;
    showLogo: boolean;
  };
  notifications: {
    client: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    team: {
      email: boolean;
      sms: boolean;
      system: boolean;
    };
  };
  warranty: {
    Structural: number;
    Waterproofing: number;
    Installations: number;
    Finishings: number;
    emergencySla: number;
    urgentSla: number;
    normalSla: number;
    abntStandards: string[];
  };
}

const DEFAULT_SETTINGS: SystemSettings = {
  company: {
    name: "A2 Incorporadora",
    cnpj: "12.345.678/0001-90",
    email: "contato@a2incorporadora.com",
    phone: "(11) 3456-7890",
    address: "Av. Paulista, 1000, São Paulo - SP",
  },
  branding: {
    primaryColor: "#2563eb",
    darkMode: false,
    showLogo: true,
  },
  notifications: {
    client: { email: true, sms: true, push: true },
    team: { email: true, sms: false, system: true },
  },
  warranty: {
    Structural: 5,
    Waterproofing: 3,
    Installations: 2,
    Finishings: 1,
    emergencySla: 24,
    urgentSla: 72,
    normalSla: 10,
    abntStandards: ["ABNT NBR 15575", "ABNT NBR 16280", "ABNT NBR 5674"],
  }
};

class SystemSettingsService {
  private settings: SystemSettings = DEFAULT_SETTINGS;
  private currentCompanyId: string | null = null;
  private loadPromise: Promise<SystemSettings> | null = null;

  async loadSettings(companyId: string): Promise<SystemSettings> {
    if (this.currentCompanyId === companyId && this.settings !== DEFAULT_SETTINGS) {
      return this.settings;
    }

    if (this.loadPromise && this.currentCompanyId === companyId) {
      return this.loadPromise;
    }

    this.currentCompanyId = companyId;
    this.loadPromise = (async () => {
      try {
        const { data, error } = await Supabase.db.findOne<any>('system_settings', companyId, 'company_id');
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data && data.settings) {
          this.settings = { ...DEFAULT_SETTINGS, ...(data.settings as any) };
        } else {
          await this.initializeDefaultSettings(companyId);
        }
        
        return this.settings;
      } catch (err) {
        errorHandler.handle(err, 'SystemSettingsService:loadSettings');
        return DEFAULT_SETTINGS;
      } finally {
        this.loadPromise = null;
      }
    })();

    return this.loadPromise;
  }

  private async initializeDefaultSettings(companyId: string) {
    try {
      await Supabase.db.create('system_settings', {
        company_id: companyId,
        settings: DEFAULT_SETTINGS
      });
    } catch (err) {
      errorHandler.handle(err, 'SystemSettingsService:initializeDefaultSettings');
    }
  }

  getSettings(): SystemSettings {
    return { ...this.settings };
  }

  async updateSettings(newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
    if (!this.currentCompanyId) throw new Error("Company ID not set");
    
    this.settings = { ...this.settings, ...newSettings };
    
    try {
      const { error } = await Supabase.db.update('system_settings', this.currentCompanyId, {
        settings: this.settings
      }, 'company_id');
      
      if (error) throw error;
      
      return this.settings;
    } catch (err) {
      throw errorHandler.handle(err, 'SystemSettingsService:updateSettings');
    }
  }

  async updateCompany(company: Partial<SystemSettings['company']>) {
    return this.updateSettings({ company: { ...this.settings.company, ...company } });
  }

  async updateBranding(branding: Partial<SystemSettings['branding']>) {
    return this.updateSettings({ branding: { ...this.settings.branding, ...branding } });
  }
}

export const systemSettingsService = new SystemSettingsService();
