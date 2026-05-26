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
}

export const qualityService = new QualityService();
