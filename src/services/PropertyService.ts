import { BaseService } from "./BaseService";
import { auditLogService } from "./AuditLogService";

export interface PropertyMilestone {
  id: string;
  title: string;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface PropertyUnit {
  id: string;
  number: string;
  floor?: string;
  status: "available" | "sold" | "delivered";
  type?: string;
}

export interface Property {
  id: string;
  name: string;
  location: string;
  units: number;
  completedUnits: number;
  status: "pending" | "progress" | "complete";
  imageUrl?: string;
  description?: string;
  totalArea?: number;
  deliveryDate?: Date;
  manager?: string;
  milestones?: PropertyMilestone[];
  unitsList?: PropertyUnit[];
}

const INITIAL_PROPERTIES: Property[] = [
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
];

class PropertyService extends BaseService<Property> {
  constructor() {
    super("a2_properties", INITIAL_PROPERTIES);
  }

  protected loadFromStorage() {
    super.loadFromStorage();
    this.items = this.items.map(p => ({
      ...p,
      milestones: p.milestones?.map(m => ({
        ...m,
        targetDate: m.targetDate ? new Date(m.targetDate) : new Date(),
        completedAt: m.completedAt ? new Date(m.completedAt) : undefined
      })),
      deliveryDate: p.deliveryDate ? new Date(p.deliveryDate) : undefined,
    }));
  }

  create(property: Omit<Property, "id">): Property {
    const newProperty = super.create(property);
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
    const oldItem = this.getById(id);
    const updated = super.update(id, property);
    
    if (updated && property.status && property.status !== oldItem?.status) {
      auditLogService.log({
        entityType: 'property',
        entityId: id,
        action: 'stage_changed',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: `Status do empreendimento ${updated.name} alterado para ${property.status}.`,
        metadata: { oldStatus: oldItem?.status, newStatus: property.status }
      });
    }
    return updated;
  }

  getMetrics() {
    const total = this.items.length;
    const totalUnits = this.items.reduce((acc, p) => acc + (p.units || 0), 0);
    const totalCompleted = this.items.reduce((acc, p) => acc + (p.completedUnits || 0), 0);
    
    return {
      total,
      totalUnits,
      totalCompleted,
      averageProgress: totalUnits > 0 ? Math.round((totalCompleted / totalUnits) * 100) : 0
    };
  }
}

export const propertyService = new PropertyService();
