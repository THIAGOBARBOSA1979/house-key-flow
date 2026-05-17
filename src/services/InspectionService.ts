
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
      technician: "1",
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
      technician: "2",
      createdAt: new Date(Date.now() - 86400000 * 1)
    }
  ];

  private technicians: Technician[] = [
    { id: "1", name: "Carlos Andrade", specialty: "Hidráulica/Geral", contact: "(11) 98888-7777", active: true },
    { id: "2", name: "Luiza Mendes", specialty: "Elétrica/Acabamento", contact: "(11) 97777-6666", active: true },
    { id: "3", name: "Roberto Santos", specialty: "Estrutural", contact: "(11) 96666-5555", active: true }
  ];

  private storageKey = "a2_inspections";
  private storageKeyTechs = "a2_technicians";

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.inspections = parsed.map((i: any) => ({
          ...i,
          date: new Date(i.date),
          createdAt: i.createdAt ? new Date(i.createdAt) : undefined,
          firstContactAt: i.firstContactAt ? new Date(i.firstContactAt) : undefined
        }));
      } catch (e) {
        console.error("Failed to load inspections", e);
      }
    }

    const storedTechs = localStorage.getItem(this.storageKeyTechs);
    if (storedTechs) {
      try {
        this.technicians = JSON.parse(storedTechs);
      } catch (e) {
        console.error("Failed to load technicians", e);
      }
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.inspections));
  }

  private persistTechs() {
    localStorage.setItem(this.storageKeyTechs, JSON.stringify(this.technicians));
  }

  getAll() {
    return [...this.inspections];
  }

  getTechnicians() {
    return [...this.technicians];
  }

  getTechnicianById(id: string) {
    return this.technicians.find(t => t.id === id);
  }

  createTechnician(data: Omit<Technician, "id">) {
    const newTech = { ...data, id: crypto.randomUUID() };
    this.technicians.push(newTech);
    this.persistTechs();
    return newTech;
  }

  schedule(data: ScheduleInspectionData, propertyInfo?: any) {
    const newInspection: Inspection = {
      id: crypto.randomUUID(),
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

    if (data.requestId) {
      const tech = this.getTechnicianById(data.technician);
      warrantyFlowService.scheduleInspection(
        data.requestId,
        data.date,
        data.technician,
        tech?.name || "Técnico",
        "admin-1"
      );
    }

    return newInspection;
  }

  suggestTechnician(date: Date, type: string) {
    const activeTechs = this.technicians.filter(t => t.active);
    
    // Sort technicians by workload on that specific date
    return activeTechs.sort((a, b) => {
      const workloadA = this.getConflicts(date, a.id).length;
      const workloadB = this.getConflicts(date, b.id).length;
      return workloadA - workloadB;
    })[0];
  }

  logFirstContact(id: string) {
    const inspection = this.inspections.find(i => i.id === id);
    if (inspection && !inspection.firstContactAt) {
      inspection.firstContactAt = new Date();
      this.persist();
      
      auditLogService.log({
        entityType: 'inspection',
        entityId: id,
        action: 'updated',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: `Primeiro contato realizado para a vistoria ${id}.`
      });
    }
  }
  
  updateStatus(id: string, status: string, details?: string) {
    const inspection = this.inspections.find(i => i.id === id);
    if (inspection) {
      const oldStatus = inspection.status;
      inspection.status = status;
      this.persist();
      
      auditLogService.log({
        entityType: 'inspection',
        entityId: id,
        action: 'stage_changed',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: details || `Status da vistoria alterado de ${oldStatus} para ${status}.`,
        metadata: { oldStatus, newStatus: status }
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

  getSLAMetrics() {
    const completed = this.inspections.filter(i => i.status === 'complete' && i.createdAt);
    if (completed.length === 0) return { avgDeliveryTime: "0d", avgFirstContact: "0d" };
    
    const totalDays = completed.reduce((acc, curr) => {
      const created = new Date(curr.createdAt!);
      const diffTime = Math.abs(curr.date.getTime() - created.getTime());
      return acc + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, 0);

    const firstContactCount = completed.filter(i => i.firstContactAt).length;
    const totalFirstContactTime = completed.filter(i => i.firstContactAt).reduce((acc, curr) => {
      const created = new Date(curr.createdAt!);
      const firstContact = new Date(curr.firstContactAt!);
      const diffTime = Math.abs(firstContact.getTime() - created.getTime());
      return acc + (diffTime / (1000 * 60 * 60)); // In hours
    }, 0);
    
    return {
      avgDeliveryTime: (totalDays / completed.length).toFixed(1) + "d",
      avgFirstContact: firstContactCount > 0 ? (totalFirstContactTime / firstContactCount).toFixed(1) + "h" : "0h"
    };
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
      const tech = this.getTechnicianById(curr.technician);
      const name = tech?.name || "Desconhecido";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
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
    const rows = this.inspections.map(i => {
      const tech = this.getTechnicianById(i.technician);
      return [
        i.id,
        i.property,
        i.unit,
        i.client,
        i.date.toLocaleDateString(),
        i.time,
        i.status,
        i.type,
        tech?.name || "Desconhecido"
      ];
    });
    
    return [headers, ...rows].map(e => e.join(",")).join("\n");
  }
}

export const inspectionService = new InspectionService();
