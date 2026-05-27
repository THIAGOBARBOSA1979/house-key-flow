import { SupabaseBaseService } from "../SupabaseBaseService";

export interface Invoice {
  id: string;
  company_id: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue" | "cancelled";
  due_date: Date;
  paid_at?: Date;
  plan_name: string;
  invoice_url?: string;
}

export interface UsageMetric {
  id: string;
  company_id: string;
  metric_name: "properties_count" | "users_count" | "storage_gb" | "inspections_count";
  current_value: number;
  limit_value: number;
}

export class BillingService extends SupabaseBaseService<Invoice> {
  constructor() {
    super("invoices");
  }

  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .order("due_date", { ascending: false });

    if (error) this.handleError(error);
    return data || [];
  }

  async getUsageMetrics(): Promise<UsageMetric[]> {
    const { data, error } = await this.supabase
      .from("usage_metrics")
      .select("*");

    if (error) this.handleError(error);
    return data || [];
  }

  async upgradePlan(newPlanId: string): Promise<void> {
    // Logic to initiate Stripe/Paddle session or update plan in DB
    const { error } = await this.supabase
      .from("companies")
      .update({ plan_id: newPlanId })
      .eq("id", await this.getCompanyId());

    if (error) this.handleError(error);
  }
}

export const billingService = new BillingService();
