import { SupabaseBaseService } from "../SupabaseBaseService";

export interface QualityIndicator {
  id: string;
  company_id: string;
  metric_name: string;
  metric_value: number;
  target_value?: number;
  period_start: Date;
  period_end: Date;
  created_at: Date;
}

class QualityService extends SupabaseBaseService<QualityIndicator> {
  constructor() {
    super({
      storageKey: "quality_indicators",
      supabaseTable: "quality_indicators",
      auditEntityType: "system",
      shouldSyncWithSupabase: true
    });
  }

  async getMetricsForPeriod(start: Date, end: Date) {
    const { SupabaseDatabase } = await import("@/integrations/supabase");
    const { data, error } = await SupabaseDatabase.findMany<QualityIndicator>('quality_indicators', {
      filters: [
        { column: 'period_start', operator: 'gte', value: start.toISOString() },
        { column: 'period_end', operator: 'lte', value: end.toISOString() }
      ]
    });
    return { data, error };
  }

  async getMetrics(companyId?: string, isSuperAdmin?: boolean) {
    const items = await this.getAll(companyId, isSuperAdmin);
    
    // Default targets based on ABNT/ISO 9001
    const defaults = {
      nps: { value: 8.9, target: 9.0, change: "+0.4", unit: "" },
      first_contact: { value: 74, target: 80, change: "-2%", unit: "%" },
      tma: { value: 14, target: 12, change: "-1.5h", unit: "h" },
      nc_rate: { value: 1.2, target: 2.0, change: "-0.3%", unit: "%" }
    };

    if (items.length === 0) return defaults;

    // Here we would actually calculate these based on real indicators stored in the DB
    // For now, let's assume the table stores periodic snapshots of these metrics
    const latestNPS = items.find(i => i.metric_name === 'NPS')?.metric_value || defaults.nps.value;
    const latestTMA = items.find(i => i.metric_name === 'TMA')?.metric_value || defaults.tma.value;

    return {
      nps: { ...defaults.nps, value: latestNPS },
      first_contact: defaults.first_contact,
      tma: { ...defaults.tma, value: latestTMA },
      nc_rate: defaults.nc_rate
    };
  }
}

export const qualityService = new QualityService();
