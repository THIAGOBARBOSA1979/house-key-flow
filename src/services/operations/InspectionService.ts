import { z } from "zod";
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
  client: string;
  date: Date;
  time: string;
  status: string;
  type: string;
  technician: string;
  checklistId?: string;
  notes?: string;
  requestId?: string;
  priority?: "low" | "medium" | "high";
  createdAt?: Date;
  firstContactAt?: Date;
  // Novos campos ABNT
  technicalStandards?: string[]; // Ex: ["ABNT NBR 15575", "ABNT NBR 5674"]
  conformityScore?: number;
  nonConformitiesFound?: number;
  reportUrl?: string;
  weatherConditions?: string; // Importante para vistorias externas
  equipmentUsed?: string[];
}

const INITIAL_INSPECTIONS: Inspection[] = [
  { 
    id: crypto.randomUUID(), 
    company_id: 'comp-1',
    property: "Edifício Aurora", 
    unit: "101", 
    client: "João Silva", 
    date: new Date(), 
    time: "09:00",
    status: "pending",
    type: "technicalInspection",
    technician: "tech-1",
    createdAt: new Date(Date.now() - 86400000 * 2)
  },
];

class InspectionService extends SupabaseBaseService<Inspection> {
  constructor() {
    super({
      storageKey: "a2_inspections",
      supabaseTable: "inspections",
      auditEntityType: "inspection",
      shouldSyncWithSupabase: true
    }, INITIAL_INSPECTIONS);
    this.initializeRealtime();
  }

  private async initializeRealtime() {
    Supabase.realtime.subscribeToTable(this.supabaseTable, async () => {
      await this.sync();
    });
  }

  getTechnicians() {
    return technicianService.getAll().map(t => ({
      id: t.id,
      name: t.name,
      specialty: t.specialty.join(", "),
      contact: t.phone,
      active: t.status === "active"
    }));
  }

  getTechnicianById(id: string) {
    const t = technicianService.getById(id);
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
    requestId?: string; 
    priority?: Inspection["priority"] 
  }, propertyInfo?: { property: string; unit: string; client: string; companyId?: string }): Promise<Inspection> {
    const newInspection = await super.create({
      property: propertyInfo?.property || "Empreendimento Exemplo",
      unit: propertyInfo?.unit || "101",
      client: propertyInfo?.client || "Cliente Exemplo",
      date: data.date,
      time: data.time,
      type: data.inspectionType,
      technician: data.technician,
      checklistId: data.checklist,
      status: "pending",
      notes: data.notes,
      requestId: data.requestId,
      priority: data.priority || "medium",
      createdAt: new Date()
    }, propertyInfo?.companyId);

    await this.log('scheduled', newInspection.id, `Vistoria agendada para ${newInspection.property}, Unidade ${newInspection.unit}.`);
    return newInspection;
  }


  async updateStatus(id: string, status: string, details?: string) {
    const oldItem = this.getById(id);
    const updated = await super.update(id, { status });
    if (updated) {
      await this.log('stage_changed', id, details || `Status da vistoria alterado de ${oldItem?.status} para ${status}.`, {
        oldStatus: oldItem?.status,
        newStatus: status
      });

      // Integração com automação de eventos para avançar jornada do cliente
      if (status === 'complete') {
        const { eventAutomationService } = await import("../core/EventAutomationService");
        const profileId = (updated as any).clientId || updated.client; // Ajuste conforme estrutura real
        eventAutomationService.onInspectionApproved(id, profileId);
      }
    }
    return updated;
  }


  getStatsByStatus(companyId?: string, isSuperAdmin?: boolean) {
    const relevantItems = this.getAll(companyId, isSuperAdmin);
    return relevantItems.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  getStatsByType(companyId?: string, isSuperAdmin?: boolean) {
    const relevantItems = this.getAll(companyId, isSuperAdmin);
    return relevantItems.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  getStatsByTechnician(companyId?: string, isSuperAdmin?: boolean) {
    const relevantItems = this.getAll(companyId, isSuperAdmin);
    return relevantItems.reduce((acc, curr) => {
      const tech = this.getTechnicianById(curr.technician);
      const name = tech?.name || "Desconhecido";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  getAllConflicts() {
    const conflicts: { date: string; technician: string; count: number }[] = [];
    const grouped = this.items.reduce((acc, current) => {
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

  getConflicts(date: Date, technicianId: string, excludeId?: string) {
    return this.items.filter(i => 
      i.date.toDateString() === date.toDateString() && 
      i.technician === technicianId &&
      i.status !== "cancelled" &&
      i.id !== excludeId
    );
  }

  getSLAMetrics() {
    return { avgDeliveryTime: "2.4d", avgFirstContact: "4.2h" };
  }

  getReport(id: string) {
    const inspection = this.getById(id);
    return inspection ? { inspection, generatedAt: new Date() } : null;
  }

  getTechnicalConformityScore(companyId?: string, isSuperAdmin?: boolean) {
    const items = this.getAll(companyId, isSuperAdmin).filter(i => i.status === 'complete' && (i as any).conformityScore !== undefined);
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

  exportData(format: 'json' | 'csv' = 'json') {
    if (format === 'json') return JSON.stringify(this.items, null, 2);
    
    const headers = ["ID", "Propriedade", "Unidade", "Cliente", "Data", "Horário", "Status", "Tipo", "Técnico"];
    const rows = this.items.map(i => [
      i.id,
      i.property,
      i.unit,
      i.client,
      i.date.toLocaleDateString(),
      i.time,
      i.status,
      i.type,
      this.getTechnicianById(i.technician)?.name || "N/A"
    ]);
    
    return [headers, ...rows].map(row => row.join(",")).join("\n");
  }

}

export const inspectionService = new InspectionService();
