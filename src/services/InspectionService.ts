import { useToast } from "@/components/ui/use-toast";
import { warrantyFlowService } from "@/services/WarrantyFlowService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScheduleInspectionData {
  inspectionType: string;
  date: Date;
  time: string;
  technician: string;
  checklist: string;
  notes?: string;
  requestId?: string; // Optional: link to a warranty request
}

class InspectionService {
  private inspections: any[] = [
    { 
      id: "1", 
      property: "Edifício Aurora", 
      unit: "101", 
      client: "João Silva", 
      date: new Date(), 
      time: "09:00",
      status: "pending",
      type: "technicalInspection",
      technician: "Carlos Andrade"
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
      technician: "Luiza Mendes"
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
      requestId: data.requestId
    };

    this.inspections.push(newInspection);
    this.persist();

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
  
  delete(id: string) {
    this.inspections = this.inspections.filter(i => i.id !== id);
    this.persist();
  }
}

export const inspectionService = new InspectionService();
