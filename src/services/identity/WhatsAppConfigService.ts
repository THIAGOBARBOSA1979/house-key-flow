import { SupabaseBaseService } from "../SupabaseBaseService";

export type WhatsAppProvider = 'evolution' | 'meta';

export interface WhatsAppConfig {
  id: string;
  company_id: string;
  provider: WhatsAppProvider;
  api_url?: string;
  api_key?: string;
  instance_name?: string;
  phone_number_id?: string;
  verify_token?: string;
  is_active: boolean;
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
    const { data, error } = await this.supabase
      .from(this.supabaseTable)
      .select('*')
      .eq('company_id', companyId)
      .single();
    
    if (error) return null;
    return data;
  }
}

export const whatsappConfigService = new WhatsAppConfigService();
