import { z } from "zod";
import { BaseService } from "../BaseService";
import { SupabaseBaseService } from "../SupabaseBaseService";
import { Supabase } from "@/integrations/supabase";
import { technicianService } from "@/services/operations/TechnicianService";
import { Database } from "@/integrations/supabase/types";

export const inspectionSchema = z.object({
  inspectionType: z.string({
    required_error: "Selecione o tipo de vistoria",
  }),
  date: z.date({
    required_error: "Selecione uma data",
  }),
  time: z.string({
    required_error: "Selecione um horário",
  }),
  technician: z.string({
    required_error: "Selecione um responsável técnico",
  }),
  checklist: z.string({
    required_error: "Selecione um checklist",
  }),
  notes: z.string().optional(),
  notifyClient: z.boolean().default(true),
  requestId: z.string().optional(),
});

export interface Inspection {
  id: string;
  company_id?: string;
  property: string;
  unit: string;
  unit_number?: string; // Standardized field
  client: string;
  client_id?: string; // Standardized field
  date: Date;
  time: string;
  status: string;
  type: string;
  technician: string;
  technician_id?: string; // Standardized field
  checklistId?: string;
  checklist_id?: string; // Standardized field
  notes?: string;
  requestId?: string;
  request_id?: string; // Standardized field
  priority?: "low" | "medium" | "high";
  createdAt?: Date;
  firstContactAt?: Date;
  // Novos campos ABNT
  technicalStandards?: string[]; // Ex: ["ABNT NBR 15575", "ABNT NBR 5674"]
  conformityScore?: number;
  conformity_score?: number; // Standardized field
  nonConformitiesFound?: number;
  reportUrl?: string;
  weatherConditions?: string; // Importante para vistorias externas
  equipmentUsed?: string[];
}

// Removed INITIAL_INSPECTIONS mock data


class InspectionService extends SupabaseBaseService<Inspection> {
  constructor() {
    super({
      storageKey: "a2_inspections",
      supabaseTable: "inspections",
      auditEntityType: "inspection",
      shouldSyncWithSupabase: true
    });
  }

  async getTechnicians() {
    const all = await technicianService.getAll();
    return all.map(t => ({
      id: t.id,
      name: t.name,
      specialty: t.specialty.join(", "),
      contact: t.phone,
      active: t.status === "active"
    }));
  }

  getTechniciansSync() {
    return technicianService.getAllSync().map(t => ({
      id: t.id,
      name: t.name,
      specialty: t.specialty.join(", "),
      contact: t.phone,
      active: t.status === "active"
    }));
  }

  async getTechnicianById(id: string) {
    const t = await technicianService.getById(id);
    if (!t) return undefined;
    return {
      id: t.id,
      name: t.name,
      specialty: t.specialty.join(", "),
      contact: t.phone,
      active: t.status === "active"
    };
  }

  getTechnicianByIdSync(id: string) {
    const t = technicianService.getByIdSync(id);
    if (!t) return undefined;
    return {
      id: t.id,
      name: t.name,
      specialty: t.specialty.join(", "),
      contact: t.phone,
      active: t.status === "active"
    };
  }

  async schedule(data: { 
    date: Date; 
    time: string; 
    inspectionType: string; 
    technician: string; 
    checklist?: string; 
    notes?: string; 
    request_id?: string; 
    priority?: Inspection["priority"] 
  }, propertyInfo?: { property: string; unit: string; client: string; company_id?: string, client_id?: string }): Promise<Inspection> {
    const newInspection = await this.create({
      property: propertyInfo?.property || "Empreendimento Exemplo",
      unit_number: propertyInfo?.unit || "101",
      client_id: propertyInfo?.client_id,
      date: data.date,
      time: data.time,
      type: data.inspectionType,
      technician_id: data.technician,
      checklist_id: data.checklist,
      status: "pending",
      notes: data.notes,
      request_id: data.request_id,
      priority: data.priority || "medium"
    } as any, propertyInfo?.company_id);

    await this.log('scheduled', newInspection.id, `Vistoria agendada para ${newInspection.property}, Unidade ${newInspection.unit_number}.`);
    return newInspection;
  }


  async updateStatus(id: string, status: string, details?: string) {
    const oldItem = await this.getById(id);
    const updated = await super.update(id, { status } as any);
    if (updated) {
      await this.log('stage_changed', id, details || `Status da vistoria alterado de ${oldItem?.status} para ${status}.`, {
        oldStatus: oldItem?.status,
        newStatus: status
      });

      // Integração com automação de eventos para avançar jornada do cliente
      if (status === 'complete' || status === 'accepted') {
        const { eventAutomationService } = await import("../core/EventAutomationService");
        const clientId = (updated as any).client_id || (updated as any).clientId;
        if (clientId) {
          eventAutomationService.onInspectionApproved(id, clientId);
        }
      }
    }
    return updated;
  }


  async getStatsByStatus(companyId?: string, isSuperAdmin?: boolean) {
    const relevantItems = await this.getAll(companyId, isSuperAdmin);
    return relevantItems.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  async getStatsByType(companyId?: string, isSuperAdmin?: boolean) {
    const relevantItems = await this.getAll(companyId, isSuperAdmin);
    return relevantItems.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  async getStatsByTechnician(companyId?: string, isSuperAdmin?: boolean) {
    const relevantItems = await this.getAll(companyId, isSuperAdmin);
    const stats: Record<string, number> = {};
    for (const curr of relevantItems) {
      const tech = await this.getTechnicianById(curr.technician);
      const name = tech?.name || "Desconhecido";
      stats[name] = (stats[name] || 0) + 1;
    }
    return stats;
  }

  async getAllConflicts() {
    const conflicts: { date: string; technician: string; count: number }[] = [];
    const items = await this.getAll(undefined, true);
    const grouped = items.reduce((acc, current) => {
      if (current.status === 'cancelled') return acc;
      const key = `${current.date.toDateString()}|${current.technician}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(grouped).forEach(([key, count]) => {
      if (count > 1) {
        const [date, technician] = key.split('|');
        conflicts.push({ date, technician, count });
      }
    });
    return conflicts;
  }

  async getConflicts(date: Date, technicianId: string, excludeId?: string) {
    const items = await this.getAll(undefined, true);
    return items.filter(i => 

      i.date.toDateString() === date.toDateString() && 
      i.technician === technicianId &&
      i.status !== "cancelled" &&
      i.id !== excludeId
    );
  }

  getSLAMetrics() {
    return { avgDeliveryTime: "2.4d", avgFirstContact: "4.2h" };
  }

  async getReport(id: string) {
    const inspection = await this.getById(id);
    return inspection ? { inspection, generatedAt: new Date() } : null;
  }

  async getTechnicalConformityScore(companyId?: string, isSuperAdmin?: boolean) {
    const itemsRaw = await this.getAll(companyId, isSuperAdmin);
    const items = itemsRaw.filter(i => i.status === 'complete' && (i as any).conformityScore !== undefined);
    if (items.length === 0) return 100;
    
    const totalScore = items.reduce((acc, curr) => acc + ((curr as any).conformityScore || 0), 0);
    return Math.round(totalScore / items.length);
  }

  getConformityTrend(companyId?: string, isSuperAdmin?: boolean) {
    // Retorna mock de tendência para o gráfico
    return [
      { month: 'Jan', score: 94 },
      { month: 'Fev', score: 95 },
      { month: 'Mar', score: 92 },
      { month: 'Abr', score: 96 },
      { month: 'Mai', score: 98 },
    ];
  }


  signAcceptance(id: string, clientId: string, signatureData: any) {
    return this.updateStatus(id, "accepted", "Cliente assinou aceite digital");
  }

  confirmPresence(id: string, clientId: string) {
    return this.updateStatus(id, "presence_confirmed", "Cliente confirmou presença");
  }

  requestReschedule(id: string, clientId: string, newDate: Date, newTime: string, reason: string) {
    return this.update(id, { date: newDate, time: newTime, status: "reschedule_requested" });
  }

  async exportData(format: 'json' | 'csv' = 'json') {
    const items = await this.getAll(undefined, true);
    if (format === 'json') return JSON.stringify(items, null, 2);
    
    const headers = ["ID", "Propriedade", "Unidade", "Cliente", "Data", "Horário", "Status", "Tipo", "Técnico"];
    const rows: string[][] = [];
    for (const i of items) {
      const tech = await this.getTechnicianById(i.technician);
      rows.push([
        i.id,
        i.property,
        i.unit,
        i.client,
        i.date.toLocaleDateString(),
        i.time,
        i.status,
        i.type,
        tech?.name || "N/A"
      ]);
    }
    
    return [headers, ...rows].map(row => row.join(",")).join("\n");
  }

}

export const inspectionService = new InspectionService();
