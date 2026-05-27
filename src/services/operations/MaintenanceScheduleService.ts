import { SupabaseBaseService } from "../SupabaseBaseService";

export interface MaintenanceSchedule {
  id: string;
  company_id: string;
  property_id: string;
  title: string;
  description?: string;
  scheduled_date: Date;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  frequency: "monthly" | "quarterly" | "biannual" | "annual";
  assigned_to?: string;
}

class MaintenanceScheduleService extends SupabaseBaseService<MaintenanceSchedule> {
  constructor() {
    super({
      storageKey: "a2_maintenance_schedules",
      supabaseTable: "maintenance_schedules",
      auditEntityType: "maintenance",
      shouldSyncWithSupabase: true
    });
  }
}

export const maintenanceScheduleService = new MaintenanceScheduleService();
