import { BaseService } from "../BaseService";
import { SupabaseBaseService } from "../SupabaseBaseService";
import { Supabase } from "@/integrations/supabase";
import { auditLogService } from "@/services/core/AuditLogService";
import { Database } from "@/integrations/supabase/types";

export interface Technician {
  id: string;
  company_id?: string;
  name: string;
  email: string;
  phone: string;
  specialty: string[];
  status: 'active' | 'inactive';
  rating: number;
  completedJobs: number;
  activeJobs: number;
  joinedAt: Date;
  experienceLevel?: 'junior' | 'mid' | 'senior';
  notes?: string;
}

// Removed INITIAL_TECHNICIANS mock data


class TechnicianService extends SupabaseBaseService<Technician> {
  constructor() {
    super({
      storageKey: "a2_technicians",
      supabaseTable: "technicians",
      auditEntityType: "user",
      shouldSyncWithSupabase: true
    });
  }


  async create(technician: Omit<Technician, "id" | "joinedAt" | "completedJobs" | "activeJobs" | "rating">): Promise<Technician> {
    const newTechnician = await super.create({
      ...technician,
      joinedAt: new Date(),
      completedJobs: 0,
      activeJobs: 0,
      rating: 5.0
    } as any);

    await auditLogService.logAction({
      entityType: 'user',
      entityId: newTechnician.id,
      action: 'created',
      payload: { message: `Técnico "${newTechnician.name}" cadastrado no sistema.` }
    });
    return newTechnician;
  }

}

export const technicianService = new TechnicianService();
