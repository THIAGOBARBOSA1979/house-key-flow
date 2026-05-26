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
    const { SupabaseAuth } = await import("@/integrations/supabase");
    const user = await SupabaseAuth.getCurrentUser();
    return this.update(id, {
      ...data,
      status: 'closed',
      closed_at: new Date(),
      closed_by: user?.id,
      updated_at: new Date()
    });
  }

  async getMetrics(companyId?: string, isSuperAdmin?: boolean) {
    const items = await this.getAll(companyId, isSuperAdmin);
    const total = items.length;
    const open = items.filter(n => n.status === 'open').length;
    const closed = items.filter(n => n.status === 'closed').length;
    const corrective = items.filter(n => n.status === 'corrective_action').length;
    
    return {
      total,
      open,
      closed,
      corrective
    };
  }
}

export const nonConformityService = new NonConformityService();
