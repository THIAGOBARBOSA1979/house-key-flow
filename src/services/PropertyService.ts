
import { z } from "zod";
import { auditLogService } from "./AuditLogService";

export const propertyMilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  targetDate: z.date(),
  completed: z.boolean().default(false),
  completedAt: z.date().optional(),
});

export type PropertyMilestone = z.infer<typeof propertyMilestoneSchema>;

export const propertyUnitSchema = z.object({
  id: z.string(),
  number: z.string(),
  floor: z.string().optional(),
  status: z.enum(["available", "sold", "delivered"]).default("available"),
  type: z.string().optional(), // e.g. "Standard", "Penthouse"
});

export type PropertyUnit = z.infer<typeof propertyUnitSchema>;

export const propertySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  location: z.string().min(5, "A localização deve ter pelo menos 5 caracteres"),
  units: z.number().min(1, "O número de unidades deve ser pelo menos 1"),
  completedUnits: z.number().min(0).default(0),
  status: z.enum(["pending", "progress", "complete"]).default("pending"),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  totalArea: z.number().optional(),
  deliveryDate: z.date().optional(),
  manager: z.string().optional(),
  milestones: z.array(propertyMilestoneSchema).optional(),
  unitsList: z.array(propertyUnitSchema).optional(),
});

export type Property = z.infer<typeof propertySchema>;

class PropertyService {
  private properties: Property[] = [
    { 
      id: "1", 
      name: "Edifício Aurora", 
      location: "São Paulo, SP", 
      units: 120, 
      completedUnits: 85, 
      status: "progress", 
      manager: "Carlos Andrade", 
      totalArea: 12500,
      milestones: [
        { id: "m1", title: "Fundação", targetDate: new Date(2023, 5, 10), completed: true, completedAt: new Date(2023, 5, 15) },
        { id: "m2", title: "Estrutura", targetDate: new Date(2024, 2, 20), completed: true, completedAt: new Date(2024, 2, 25) },
        { id: "m3", title: "Acabamento", targetDate: new Date(2025, 8, 30), completed: false }
      ]
    },
    { id: "2", name: "Residencial Bosque Verde", location: "Rio de Janeiro, RJ", units: 75, completedUnits: 75, status: "complete", manager: "Luiza Mendes", totalArea: 8400 },
    { id: "3", name: "Condomínio Monte Azul", location: "Belo Horizonte, MG", units: 50, completedUnits: 10, status: "pending", manager: "Roberto Santos", totalArea: 5200 },
    { id: "4", name: "Residencial Parque das Flores", location: "Curitiba, PR", units: 60, completedUnits: 60, status: "complete", manager: "Carlos Andrade", totalArea: 6800 },
    { id: "5", name: "Condomínio Vista Mar", location: "Salvador, BA", units: 40, completedUnits: 35, status: "progress", manager: "Juliana Costa", totalArea: 4100 },
    { id: "6", name: "Edifício Horizonte", location: "Brasília, DF", units: 80, completedUnits: 0, status: "pending", manager: "Roberto Santos", totalArea: 9200 },
  ];

  private storageKey = "a2_properties";

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.properties = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load properties from storage", e);
      }
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.properties));
  }

  getAll(): Property[] {
    return [...this.properties];
  }

  getById(id: string): Property | undefined {
    return this.properties.find(p => p.id === id);
  }

  create(property: Omit<Property, "id">): Property {
    const newProperty = {
      ...property,
      id: Math.random().toString(36).substr(2, 9),
    };
    this.properties.push(newProperty);
    this.persist();
    auditLogService.log({
      entityType: 'property',
      entityId: newProperty.id,
      action: 'created',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Empreendimento ${newProperty.name} criado.`
    });
    return newProperty;
  }

  update(id: string, property: Partial<Property>): Property | undefined {
    const index = this.properties.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    const oldStatus = this.properties[index].status;
    this.properties[index] = { ...this.properties[index], ...property };
    this.persist();

    if (property.status && property.status !== oldStatus) {
      auditLogService.log({
        entityType: 'property',
        entityId: id,
        action: 'stage_changed',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: `Status do empreendimento ${this.properties[index].name} alterado para ${property.status}.`,
        metadata: { oldStatus, newStatus: property.status }
      });
    }

    return this.properties[index];
  }

  delete(id: string): boolean {
    const initialLength = this.properties.length;
    this.properties = this.properties.filter(p => p.id !== id);
    if (this.properties.length !== initialLength) {
      this.persist();
      return true;
    }
    return false;
  }
  getMetrics() {
    const total = this.properties.length;
    const byStatus = this.properties.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalUnits = this.properties.reduce((acc, p) => acc + p.units, 0);
    const totalCompleted = this.properties.reduce((acc, p) => acc + p.completedUnits, 0);
    
    return {
      total,
      byStatus,
      totalUnits,
      totalCompleted,
      averageProgress: totalUnits > 0 ? Math.round((totalCompleted / totalUnits) * 100) : 0
    };
  }
}

export const propertyService = new PropertyService();
