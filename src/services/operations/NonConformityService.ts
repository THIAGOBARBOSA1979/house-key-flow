import { SupabaseBaseService } from "../SupabaseBaseService";

export interface NonConformity {
  id: string;
  company_id: string;
  title: string;
  description: string;
  origin: 'inspection' | 'warranty' | 'audit' | 'customer_complaint';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'corrective_action' | 'closed';
  identified_at: Date;
  root_cause?: string;
  corrective_action?: string;
  prevention_plan?: string;
  closed_at?: Date;
  closed_by?: string;
  created_at: Date;
  updated_at: Date;
}

class NonConformityService extends SupabaseBaseService<NonConformity> {
  constructor() {
    super({
      storageKey: "non_conformities",
      supabaseTable: "non_conformities",
      auditEntityType: "system",
      shouldSyncWithSupabase: true
    });
  }

  async close(id: string, data: { root_cause: string; corrective_action: string; prevention_plan: string }) {
    const { user } = (await (await import("@/integrations/supabase")).Supabase.auth.getUser()).data;
    return this.update(id, {
      ...data,
      status: 'closed',
      closed_at: new Date(),
      closed_by: user?.id,
      updated_at: new Date()
    });
  }
}

export const nonConformityService = new NonConformityService();
