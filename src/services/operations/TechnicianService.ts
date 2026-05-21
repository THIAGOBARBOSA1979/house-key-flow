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

const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: "tech-1",
    company_id: "comp-1",
    name: "Carlos Andrade",
    email: "carlos.andrade@a2.com",
    phone: "(11) 98765-4321",
    specialty: ["Hidráulica", "Alvenaria"],
    status: "active",
    rating: 4.8,
    completedJobs: 124,
    activeJobs: 3,
    joinedAt: new Date(2023, 1, 15),
    experienceLevel: 'senior',
    notes: "Especialista em detecção de vazamentos e estrutural."
  },
  {
    id: "tech-2",
    company_id: "comp-1",
    name: "Ricardo Souza",
    email: "ricardo.souza@a2.com",
    phone: "(11) 97765-4322",
    specialty: ["Elétrica", "Pintura"],
    status: "active",
    rating: 4.9,
    completedJobs: 89,
    activeJobs: 1,
    joinedAt: new Date(2023, 5, 20),
    experienceLevel: 'mid',
    notes: "Focado em automação residencial e instalações elétricas complexas."
  },
  {
    id: "tech-3",
    company_id: "comp-1",
    name: "Juliana Costa",
    email: "juliana.costa@a2.com",
    phone: "(11) 96665-4323",
    specialty: ["Acabamento", "Gesso"],
    status: "active",
    rating: 4.7,
    completedJobs: 56,
    activeJobs: 4,
    joinedAt: new Date(2024, 0, 10),
    experienceLevel: 'junior',
    notes: "Agilidade em acabamentos finos e decorações em gesso."
  }
];

class TechnicianService extends SupabaseBaseService<Technician> {
  constructor() {
    super({
      storageKey: "a2_technicians",
      supabaseTable: "technicians",
      auditEntityType: "user",
      shouldSyncWithSupabase: true

    }, []);
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
