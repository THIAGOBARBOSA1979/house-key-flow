import { SupabaseBaseService } from "../SupabaseBaseService";
import { Supabase } from "@/integrations/supabase";

export type WhatsAppProvider = 'evolution' | 'meta';

export interface WhatsAppConfig {
  id: string;
  companyId: string;
  provider: WhatsAppProvider;
  apiUrl?: string;
  apiKey?: string;
  instanceName?: string;
  phoneNumberId?: string;
  verifyToken?: string;
  isActive: boolean;
}

class WhatsAppConfigService extends SupabaseBaseService<WhatsAppConfig> {
  constructor() {
    super({
      storageKey: "a2_whatsapp_configs",
      supabaseTable: "whatsapp_configs",
      auditEntityType: "system",
      shouldSyncWithSupabase: true
    });
  }

  async getConfigByCompany(companyId: string): Promise<WhatsAppConfig | null> {
    const { data, error } = await Supabase.db.findOne<any>(this.supabaseTable, companyId, 'company_id');
    
    if (error) return null;
    return this.mapFromSupabase(data);
  }
}

export const whatsappConfigService = new WhatsAppConfigService();
