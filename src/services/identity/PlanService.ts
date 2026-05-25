import { BaseService } from "../BaseService";
import { SupabaseBaseService } from "../SupabaseBaseService";

export type Plan = {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_properties: number;
  max_users: number;
  max_storage_mb: number;
  features: string[];
  is_active: boolean;
};

class PlanService extends SupabaseBaseService<Plan> {
  constructor() {
    super({
      storageKey: "a2_plans",
      supabaseTable: "plans",
      auditEntityType: "system",
      shouldSyncWithSupabase: true
    });
  }

  async getActivePlans(): Promise<Plan[]> {
    return this.items.filter(p => p.is_active);
  }
}

export const planService = new PlanService();
