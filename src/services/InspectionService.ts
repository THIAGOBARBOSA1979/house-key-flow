import { useToast } from "@/components/ui/use-toast";
import { warrantyFlowService } from "@/services/WarrantyFlowService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { auditLogService } from "./AuditLogService";

interface ScheduleInspectionData {
  inspectionType: string;
  date: Date;
  time: string;
  technician: string;
  checklist: string;
  notes?: string;
  requestId?: string;
  priority?: "low" | "medium" | "high";
}

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
  notes?: string;
  requestId?: string;
  priority?: "low" | "medium" | "high";
  createdAt?: Date;
}

class InspectionService {
  private inspections: Inspection[] = [
    { 
      id: "1", 
      property: "Edifício Aurora", 
      unit: "101", 
      client: "João Silva", 
      date: new Date(), 
      time: "09:00",
      status: "pending",
      type: "technicalInspection",
      technician: "Carlos Andrade",
      createdAt: new Date(Date.now() - 86400000 * 2)
    },
    { 
      id: "2", 
      property: "Residencial Bosque Verde", 
      unit: "302", 
      client: "Maria Santos", 
      date: new Date(), 
      time: "14:30",
      status: "progress",
      type: "keyDelivery",
      technician: "Luiza Mendes",
      createdAt: new Date(Date.now() - 86400000 * 1)
    },
    { 
      id: "3", 
      property: "Condomínio Monte Azul", 
      unit: "505", 
      client: "Pedro Oliveira", 
      date: new Date(Date.now() - 86400000 * 3), 
      time: "10:00",
      status: "complete",
      type: "postWork",
      technician: "Carlos Andrade",
      createdAt: new Date(Date.now() - 86400000 * 5)
    },
    { 
      id: "4", 
      property: "Edifício Aurora", 
      unit: "202", 
      client: "Ana Costa", 
      date: new Date(Date.now() + 86400000 * 2), 
      time: "11:00",
      status: "pending",
      type: "keyDelivery",
      technician: "Roberto Santos",
      createdAt: new Date()
    },
  ];

  private storageKey = "a2_inspections";

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.inspections = parsed.map((i: any) => ({
          ...i,
          date: new Date(i.date)
        }));
      } catch (e) {
        console.error("Failed to load inspections", e);
      }
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.inspections));
  }

  getAll() {
    return [...this.inspections];
  }

  schedule(data: ScheduleInspectionData, propertyInfo?: any) {
    const newInspection = {
      id: Math.random().toString(36).substr(2, 9),
      property: propertyInfo?.property || "Empreendimento Exemplo",
      unit: propertyInfo?.unit || "101",
      client: propertyInfo?.client || "Cliente Exemplo",
      date: data.date,
      time: data.time,
      type: data.inspectionType,
      technician: data.technician,
      status: "pending",
      notes: data.notes,
      requestId: data.requestId,
      priority: data.priority || "medium",
      createdAt: new Date()
    };

    this.inspections.push(newInspection);
    this.persist();
    
    auditLogService.log({
      entityType: 'inspection',
      entityId: newInspection.id,
      action: 'scheduled',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Vistoria do tipo ${newInspection.type} agendada para ${newInspection.property}, Unidade ${newInspection.unit}.`
    });

    // If linked to a warranty request, update it
    if (data.requestId) {
      // Find technician name
      const techNames: Record<string, string> = {
        "1": "Carlos Andrade",
        "2": "Luiza Mendes",
        "3": "Roberto Santos"
      };
      
      warrantyFlowService.scheduleInspection(
        data.requestId,
        data.date,
        data.technician,
        techNames[data.technician] || "Técnico",
        "admin-1"
      );
    }

    return newInspection;
  }
  
  updateStatus(id: string, status: string) {
    const inspection = this.inspections.find(i => i.id === id);
    if (inspection) {
      inspection.status = status;
      this.persist();
      
      auditLogService.log({
        entityType: 'inspection',
        entityId: id,
        action: 'stage_changed',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: `Status da vistoria alterado para ${status}.`
      });
    }
  }
  
  getConflicts(date: Date, technicianId: string, excludeId?: string) {
    return this.inspections.filter(i => 
      i.date.toDateString() === date.toDateString() && 
      i.technician === technicianId &&
      i.status !== "cancelled" &&
      i.id !== excludeId
    );
  }

  getAllConflicts() {
    const conflicts: { date: string; technician: string; count: number }[] = [];
    const grouped = this.inspections.reduce((acc, current) => {
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

  delete(id: string) {
    this.inspections = this.inspections.filter(i => i.id !== id);
    this.persist();
  }

  update(id: string, data: Partial<Inspection>) {
    const index = this.inspections.findIndex(i => i.id === id);
    if (index !== -1) {
      this.inspections[index] = { ...this.inspections[index], ...data };
      this.persist();
      
      auditLogService.log({
        entityType: 'inspection',
        entityId: id,
        action: 'updated',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: `Agendamento ${id} atualizado.`
      });
      return true;
    }
    return false;
  }

  exportData(format: 'json' | 'csv' = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.inspections, null, 2);
    }
    
    const headers = ['ID', 'Propriedade', 'Unidade', 'Cliente', 'Data', 'Hora', 'Status', 'Tipo', 'Técnico'];
    const rows = this.inspections.map(i => [
      i.id,
      i.property,
      i.unit,
      i.client,
      i.date.toLocaleDateString(),
      i.time,
      i.status,
      i.type,
      i.technician
    ]);
    
    return [headers, ...rows].map(e => e.join(",")).join("\n");
  }

  getSLAMetrics() {
    const completed = this.inspections.filter(i => i.status === 'completed' && i.createdAt);
    if (completed.length === 0) return "0d";
    
    const totalDays = completed.reduce((acc, curr) => {
      const created = new Date(curr.createdAt!);
      const diffTime = Math.abs(curr.date.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return acc + diffDays;
    }, 0);
    
    return (totalDays / completed.length).toFixed(1) + "d";
  }

  getStatsByStatus() {
    return this.inspections.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  getStatsByType() {
    return this.inspections.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  getStatsByTechnician() {
    return this.inspections.reduce((acc, curr) => {
      acc[curr.technician] = (acc[curr.technician] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const inspectionService = new InspectionService();
