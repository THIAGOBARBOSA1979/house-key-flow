import { z } from "zod";
import { SupabaseBaseService } from "../SupabaseBaseService";
import { Supabase } from "@/integrations/supabase";
import { Property, PropertyMilestone, PropertyUnit, PropertyMetrics } from "@/types/property";

export const propertyMilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  targetDate: z.date(),
  completed: z.boolean().default(false),
  completedAt: z.date().optional(),
});

export const propertyUnitSchema = z.object({
  id: z.string(),
  number: z.string(),
  floor: z.string().optional(),
  status: z.enum(["available", "sold", "delivered"]).default("available"),
  type: z.string().optional(),
});

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
  createdAt: z.date().optional(),
});

const INITIAL_PROPERTIES: Property[] = [
  { 
    id: "1", 
    company_id: "comp-1",
    name: "Edifício Aurora", 
    location: "São Paulo, SP", 
    units: 120, 
    completedUnits: 85, 
    status: "progress", 
    manager: "Carlos Andrade", 
    totalArea: 12500,
    createdAt: new Date(2023, 0, 1),
    milestones: [
      { id: "m1", title: "Fundação", targetDate: new Date(2023, 5, 10), completed: true, completedAt: new Date(2023, 5, 15) },
      { id: "m2", title: "Estrutura", targetDate: new Date(2024, 1, 20), completed: true, completedAt: new Date(2024, 1, 25) },
      { id: "m3", title: "Acabamento", targetDate: new Date(2025, 7, 30), completed: false }
    ]
  },
  { id: "2", company_id: "comp-1", name: "Residencial Bosque Verde", location: "Rio de Janeiro, RJ", units: 75, completedUnits: 75, status: "complete", manager: "Luiza Mendes", totalArea: 8400, createdAt: new Date(2022, 5, 1) },
  { id: "3", company_id: "comp-1", name: "Condomínio Monte Azul", location: "Belo Horizonte, MG", units: 50, completedUnits: 10, status: "pending", manager: "Roberto Santos", totalArea: 5200, createdAt: new Date(2023, 10, 1) },
];

class PropertyService extends SupabaseBaseService<Property> {
  constructor() {
    super({
      storageKey: "a2_properties",
      supabaseTable: "properties",
      auditEntityType: "property",
      shouldSyncWithSupabase: true
    }, INITIAL_PROPERTIES);
    this.initializeRealtime();
  }

  private async initializeRealtime() {
    Supabase.realtime.subscribeToTable(this.supabaseTable, async () => {
      await this.sync();
    });
  }

  async create(property: Omit<Property, "id">, companyId?: string): Promise<Property> {
    return await super.create({
      ...property,
      createdAt: property.createdAt || new Date(),
    }, companyId);
  }

  async update(id: string, property: Partial<Property>, isSuperAdmin?: boolean): Promise<Property | undefined> {
    const oldItem = this.getById(id, undefined, isSuperAdmin);
    const updated = await super.update(id, property, isSuperAdmin);

    if (updated && property.status && property.status !== oldItem?.status) {
      await this.log('stage_changed', id, `Status do empreendimento ${updated.name} alterado para ${property.status}.`, {
        oldStatus: oldItem?.status,
        newStatus: property.status
      });
    }
    return updated;
  }


  async updateMilestone(propertyId: string, milestoneId: string, completed: boolean, isSuperAdmin?: boolean): Promise<Property | undefined> {
    const property = this.getById(propertyId, undefined, isSuperAdmin);
    if (!property || !property.milestones) return undefined;

    const milestones = property.milestones.map(m => 
      m.id === milestoneId ? { ...m, completed, completedAt: completed ? new Date() : undefined } : m
    );

    const updated = await this.update(propertyId, { milestones }, isSuperAdmin);
    
    if (updated) {
      const milestone = property.milestones.find(m => m.id === milestoneId);
      if (milestone) {
        await this.log('updated', propertyId, `Marco "${milestone.title}" do empreendimento ${property.name} marcado como ${completed ? 'concluído' : 'pendente'}.`);
      }
    }

    return updated;
  }


  async updateUnitStatus(propertyId: string, unitId: string, status: PropertyUnit['status']): Promise<Property | undefined> {
    const property = this.getById(propertyId);
    if (!property || !property.unitsList) return undefined;

    const unit = property.unitsList.find(u => u.id === unitId);
    const unitsList = property.unitsList.map(u => 
      u.id === unitId ? { ...u, status } : u
    );

    const updated = await this.update(propertyId, { unitsList });

    if (updated && unit) {
      await this.log('updated', propertyId, `Status da unidade ${unit.number} do empreendimento ${property.name} alterado para ${status}.`);
    }

    return updated;
  }


  async batchCreateUnits(propertyId: string, floorStart: number, floorEnd: number, unitsPerFloor: number, prefix: string = "") {
    const property = this.getById(propertyId);
    if (!property) return null;

    const newUnits: PropertyUnit[] = [];
    for (let f = floorStart; f <= floorEnd; f++) {
      for (let u = 1; u <= unitsPerFloor; u++) {
        const unitNumber = `${prefix}${f}${u.toString().padStart(2, '0')}`;
        newUnits.push({
          id: crypto.randomUUID(),
          number: unitNumber,
          floor: f.toString(),
          status: "available",
          type: "Standard"
        });
      }
    }

    const unitsList = [...(property.unitsList || []), ...newUnits];
    return await this.update(propertyId, { 
      unitsList,
      units: unitsList.length 
    });
  }


  getMetrics(companyId?: string, isSuperAdmin?: boolean): PropertyMetrics {
    const relevantItems = this.getAll(companyId, isSuperAdmin);
    const total = relevantItems.length;
    const byStatus = relevantItems.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalUnits = relevantItems.reduce((acc, p) => acc + (p.units || 0), 0);
    const totalCompleted = relevantItems.reduce((acc, p) => acc + (p.completedUnits || 0), 0);
    
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
export type { Property, PropertyMilestone, PropertyUnit, PropertyMetrics };
