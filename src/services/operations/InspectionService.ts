import { z } from "zod";
import { SupabaseBaseService } from "../SupabaseBaseService";
import { auditLogService } from "../core/AuditLogService";
import { technicianService, Technician } from "../operations/TechnicianService";

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
}


const INITIAL_INSPECTIONS: Inspection[] = [
  { 
    id: crypto.randomUUID(), 
    property: "Edifício Aurora", 
    unit: "101", 
    client: "João Silva", 
    date: new Date(), 
    time: "09:00",
    status: "pending",
    type: "technicalInspection",
    technician: "1",
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

  schedule(data: { date: Date; time: string; inspectionType: string; technician: string; checklist?: string; notes?: string; requestId?: string; priority?: Inspection["priority"] }, propertyInfo?: { property: string; unit: string; client: string }): Inspection {
    const newInspection = super.create({
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
    } as Omit<Inspection, "id">);


    this.log('scheduled', newInspection.id, `Vistoria agendada para ${newInspection.property}, Unidade ${newInspection.unit}.`);


    return newInspection;
  }

  updateStatus(id: string, status: string, details?: string) {
    const oldItem = this.getById(id);
    const updated = super.update(id, { status });
    if (updated) {
      this.log('stage_changed', id, details || `Status da vistoria alterado de ${oldItem?.status} para ${status}.`, {
        oldStatus: oldItem?.status,
        newStatus: status
      });

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

  exportData(format: 'json' | 'csv' = 'json') {
    return format === 'json' ? JSON.stringify(this.items) : "";
  }

  getReport(id: string) {
    const inspection = this.getById(id);
    return inspection ? { inspection, generatedAt: new Date() } : null;
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

}

export const inspectionService = new InspectionService();
