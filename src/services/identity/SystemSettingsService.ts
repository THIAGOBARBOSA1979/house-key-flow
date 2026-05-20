
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
  private storageKey = "a2_system_settings";

  constructor() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
  }

  getSettings(): SystemSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<SystemSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.persist();
    return this.settings;
  }

  updateCompany(company: Partial<SystemSettings['company']>) {
    this.settings.company = { ...this.settings.company, ...company };
    this.persist();
  }

  updateBranding(branding: Partial<SystemSettings['branding']>) {
    this.settings.branding = { ...this.settings.branding, ...branding };
    this.persist();
  }
}

export const systemSettingsService = new SystemSettingsService();
