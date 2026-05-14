
import { inspectionService } from "@/services/InspectionService";

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
const getAppointmentsFromService = (): Appointment[] => {
  const inspections = inspectionService.getAll();
  return inspections.map(ins => ({
    id: ins.id,
    title: ins.type === 'keyDelivery' ? 'Entrega de chaves' : 
           ins.type === 'technicalInspection' ? 'Vistoria técnica' : 
           ins.type === 'postWork' ? 'Pós-obra' : 'Vistoria',
    property: ins.property,
    unit: ins.unit,
    client: ins.client,
    date: new Date(ins.date.getFullYear(), ins.date.getMonth(), ins.date.getDate(), 
                  parseInt(ins.time.split(':')[0] || '0'), parseInt(ins.time.split(':')[1] || '0')),
    type: "inspection",
    status: ins.status as AppointmentStatus,
    technician: ins.technician,
    notes: ins.notes
  }));
};

// Initial data for appointments
export const appointments: Appointment[] = [
  ...getAppointmentsFromService(),
  {
    id: "1",
    title: "Vistoria de entrega",
    property: "Edifício Aurora",
    unit: "507",
    client: "Carlos Silva",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 10, 0),
    type: "inspection",
    status: "pending",
    priority: "high"
  },
  {
    id: "2",
    title: "Vistoria de entrega",
    property: "Edifício Aurora",
    unit: "204",
    client: "Maria Oliveira",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 14, 30),
    type: "inspection",
    status: "confirmed",
    priority: "medium"
  },
  {
    id: "3",
    title: "Atendimento técnico",
    property: "Residencial Bosque Verde",
    unit: "102",
    client: "Roberto Pereira",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 9, 0),
    type: "warranty",
    status: "completed",
    priority: "low"
  },
  {
    id: "4",
    title: "Vistoria pré-entrega",
    property: "Condomínio Monte Azul",
    unit: "301",
    client: "Juliana Costa",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 15, 0),
    type: "inspection",
    status: "confirmed",
    priority: "high"
  },
  {
    id: "5",
    title: "Atendimento técnico",
    property: "Residencial Bosque Verde",
    unit: "405",
    client: "Fernando Martins",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 10, 30),
    type: "warranty",
    status: "pending",
    priority: "medium"
  },
  {
    id: "6",
    title: "Entrega de chaves",
    property: "Edifício Aurora",
    unit: "602",
    client: "Luciana Santos",
    date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3, 11, 0),
    type: "inspection",
    status: "cancelled",
    priority: "medium"
  },
];
