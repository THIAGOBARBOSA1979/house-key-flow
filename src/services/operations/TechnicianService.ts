import { BaseService } from "../BaseService";
import { auditLogService } from '../core/AuditLogService';

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string[];
  status: 'active' | 'inactive';
  rating: number;
  completedJobs: number;
  activeJobs: number;
  joinedAt: Date;
}

const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: "tech-1",
    name: "Carlos Andrade",
    email: "carlos.andrade@a2.com",
    phone: "(11) 98765-4321",
    specialty: ["Hidráulica", "Alvenaria"],
    status: "active",
    rating: 4.8,
    completedJobs: 124,
    activeJobs: 3,
    joinedAt: new Date(2023, 1, 15)
  },
  {
    id: "tech-2",
    name: "Ricardo Souza",
    email: "ricardo.souza@a2.com",
    phone: "(11) 97765-4322",
    specialty: ["Elétrica", "Pintura"],
    status: "active",
    rating: 4.9,
    completedJobs: 89,
    activeJobs: 1,
    joinedAt: new Date(2023, 5, 20)
  },
  {
    id: "tech-3",
    name: "Juliana Costa",
    email: "juliana.costa@a2.com",
    phone: "(11) 96665-4323",
    specialty: ["Acabamento", "Gesso"],
    status: "active",
    rating: 4.7,
    completedJobs: 56,
    activeJobs: 4,
    joinedAt: new Date(2024, 0, 10)
  }
];

class TechnicianService extends BaseService<Technician> {
  constructor() {
    super("a2_technicians", INITIAL_TECHNICIANS);
  }

  create(technician: Omit<Technician, "id" | "joinedAt" | "completedJobs" | "activeJobs" | "rating">): Technician {
    const newTechnician = super.create({
      ...technician,
      joinedAt: new Date(),
      completedJobs: 0,
      activeJobs: 0,
      rating: 5.0
    } as any);

    auditLogService.log({
      entityType: 'user',
      entityId: newTechnician.id,
      action: 'created',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Técnico "${newTechnician.name}" cadastrado no sistema.`
    });
    return newTechnician;
  }
}

export const technicianService = new TechnicianService();
