
import { auditLogService } from './AuditLogService';

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

class TechnicianService {
  private storageKey = "a2_technicians";
  private technicians: Technician[] = [
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

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.technicians = parsed.map((t: any) => ({
          ...t,
          joinedAt: new Date(t.joinedAt)
        }));
      } catch (e) {
        console.error("Failed to load technicians", e);
      }
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.technicians));
  }

  getAll(): Technician[] {
    return [...this.technicians];
  }

  getById(id: string): Technician | undefined {
    return this.technicians.find(t => t.id === id);
  }

  create(technician: Omit<Technician, "id" | "joinedAt" | "completedJobs" | "activeJobs" | "rating">): Technician {
    const newTechnician: Technician = {
      ...technician,
      id: crypto.randomUUID(),
      joinedAt: new Date(),
      completedJobs: 0,
      activeJobs: 0,
      rating: 5.0
    };
    this.technicians.push(newTechnician);
    this.persist();
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

  update(id: string, updates: Partial<Technician>): Technician | undefined {
    const index = this.technicians.findIndex(t => t.id === id);
    if (index === -1) return undefined;

    this.technicians[index] = { ...this.technicians[index], ...updates };
    this.persist();
    return this.technicians[index];
  }

  delete(id: string): boolean {
    const initialLength = this.technicians.length;
    this.technicians = this.technicians.filter(t => t.id !== id);
    if (this.technicians.length !== initialLength) {
      this.persist();
      return true;
    }
    return false;
  }
}

export const technicianService = new TechnicianService();
