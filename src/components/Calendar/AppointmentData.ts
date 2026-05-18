
import { inspectionService } from "@/services";

export type AppointmentType = "inspection" | "warranty" | "delivery" | "technical_visit";
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";

export interface Appointment {
  id: string;
  title: string;
  property: string;
  unit: string;
  client: string;
  date: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  technician?: string;
  notes?: string;
  checklist?: string;
  priority?: "low" | "medium" | "high";
}

// Convert service data to Appointment format
const mapServiceToAppointment = (ins: {
  id: string;
  type: string;
  property: string;
  unit: string;
  client: string;
  date: Date;
  time: string;
  status: string;
  technician?: string;
  notes?: string;
  priority?: "low" | "medium" | "high";
}): Appointment => ({
  id: ins.id,
  title: ins.type === 'keyDelivery' ? 'Entrega de chaves' : 
         ins.type === 'technicalInspection' ? 'Vistoria técnica' : 
         ins.type === 'postWork' ? 'Pós-obra' : 
         ins.type === 'inspection' ? 'Vistoria de entrega' :
         ins.type === 'warranty' ? 'Atendimento técnico' :
         ins.type === 'technical_visit' ? 'Visita Técnica' : 'Agendamento',
  property: ins.property,
  unit: ins.unit,
  client: ins.client,
  date: new Date(ins.date.getFullYear(), ins.date.getMonth(), ins.date.getDate(), 
                parseInt(ins.time.split(':')[0] || '0'), parseInt(ins.time.split(':')[1] || '0')),
  type: (ins.type === 'keyDelivery' || ins.type === 'technicalInspection' || ins.type === 'postWork' || ins.type === 'inspection') ? 'inspection' : 
        ins.type === 'warranty' ? 'warranty' : 
        ins.type === 'delivery' ? 'delivery' : 'technical_visit',
  status: ins.status as AppointmentStatus,
  technician: ins.technician,
  notes: ins.notes,
  priority: ins.priority || "medium"
});

// Mock static data to seed if service is empty (first run)
const staticMockData: any[] = [
  {
    id: "m1",
    type: "inspection",
    property: "Edifício Aurora",
    unit: "507",
    client: "Carlos Silva",
    date: new Date(),
    time: "10:00",
    status: "pending",
    priority: "high"
  },
  {
    id: "m2",
    type: "inspection",
    property: "Edifício Aurora",
    unit: "204",
    client: "Maria Oliveira",
    date: new Date(),
    time: "14:30",
    status: "confirmed",
    priority: "medium"
  },
  {
    id: "m3",
    type: "warranty",
    property: "Residencial Bosque Verde",
    unit: "102",
    client: "Roberto Pereira",
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    time: "09:00",
    status: "completed",
    priority: "low"
  }
];

// Combine service data and provide as a single exported variable
export const getUnifiedAppointments = (): Appointment[] => {
  const serviceInspections = inspectionService.getAll();
  
  // If no service data, return static mock for UI demo purposes
  if (serviceInspections.length <= 2 && !localStorage.getItem("a2_inspections")) {
     // The service starts with 2 items by default, we can add static mock if needed
     // But for now let's just use what's in the service
  }
  
  return serviceInspections.map(mapServiceToAppointment);
};

// For backward compatibility while we refactor components
export const appointments = getUnifiedAppointments();
