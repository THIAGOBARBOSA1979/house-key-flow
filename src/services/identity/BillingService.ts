import { SupabaseBaseService, SupabaseBaseServiceOptions } from "../SupabaseBaseService";
import { BaseEntity } from "@/types/shared";
import { Supabase } from "@/integrations/supabase";

export interface Invoice extends BaseEntity {
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue" | "cancelled";
  dueDate: string;
  paidAt?: string;
  planName: string;
  invoiceUrl?: string;
}

export interface UsageMetric extends BaseEntity {
  metricName: "properties_count" | "users_count" | "storage_gb" | "inspections_count";
  currentValue: number;
  limitValue: number;
}

export class BillingService extends SupabaseBaseService<Invoice> {
  constructor() {
    const options: SupabaseBaseServiceOptions = {
      storageKey: "a2_invoices",
      supabaseTable: "invoices" as any,
      fieldMapping: {
        dueDate: "due_date",
        paidAt: "paid_at",
        planName: "plan_name",
        invoiceUrl: "invoice_url"
      }
    };
    super(options);
  }

  async getInvoices(): Promise<Invoice[]> {
    return this.getAll();
  }

  async getUsageMetrics(): Promise<UsageMetric[]> {
    const { data, error } = await Supabase.db.findMany<any>("usage_metrics" as any);
    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      company_id: item.company_id,
      metricName: item.metric_name,
      currentValue: item.current_value,
      limitValue: item.limit_value
    }));
  }

  protected async getCompanyId(): Promise<string> {
    const user = await Supabase.auth.getCurrentUser();
    return user?.user_metadata?.company_id || "";
  }

  async upgradePlan(newPlanId: string): Promise<void> {
    const companyId = await this.getCompanyId();
    const { error } = await Supabase.db.update("companies" as any, companyId, { plan_id: newPlanId });
    if (error) throw error;
  }
}

export const billingService = new BillingService();
