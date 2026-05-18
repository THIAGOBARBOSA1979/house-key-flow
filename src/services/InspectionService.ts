import { BaseService } from "./BaseService";
import { auditLogService } from "./AuditLogService";

export interface Inspection {
  id: string;
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

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  contact: string;
  active: boolean;
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

class InspectionService extends BaseService<Inspection> {
  private technicians: Technician[] = [
    { id: "1", name: "Carlos Andrade", specialty: "Hidráulica/Geral", contact: "(11) 98888-7777", active: true },
    { id: "2", name: "Luiza Mendes", specialty: "Elétrica/Acabamento", contact: "(11) 97777-6666", active: true },
  ];

  constructor() {
    super("a2_inspections", INITIAL_INSPECTIONS);
  }

  protected loadFromStorage() {
    super.loadFromStorage();
    this.items = this.items.map(i => ({
      ...i,
      date: new Date(i.date),
      createdAt: i.createdAt ? new Date(i.createdAt) : undefined,
      firstContactAt: i.firstContactAt ? new Date(i.firstContactAt) : undefined
    }));
  }

  getTechnicians() {
    return [...this.technicians];
  }

  getTechnicianById(id: string) {
    return this.technicians.find(t => t.id === id);
  }

  schedule(data: any, propertyInfo?: any): Inspection {
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
    } as any);

    auditLogService.log({
      entityType: 'inspection',
      entityId: newInspection.id,
      action: 'scheduled',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Vistoria agendada para ${newInspection.property}, Unidade ${newInspection.unit}.`
    });

    return newInspection;
  }

  updateStatus(id: string, status: string, details?: string) {
    const oldItem = this.getById(id);
    const updated = super.update(id, { status });
    if (updated) {
      auditLogService.log({
        entityType: 'inspection',
        entityId: id,
        action: 'stage_changed',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: details || `Status da vistoria alterado de ${oldItem?.status} para ${status}.`,
        metadata: { oldStatus: oldItem?.status, newStatus: status }
      });
    }
    return updated;
  }

  getStatsByStatus() {
    return this.items.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const inspectionService = new InspectionService();
