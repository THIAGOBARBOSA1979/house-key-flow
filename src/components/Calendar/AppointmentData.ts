
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
    date: new Date(2025, 4, 19, 10, 0),
    type: "inspection",
    status: "pending"
  },
  {
    id: "2",
    title: "Vistoria de entrega",
    property: "Edifício Aurora",
    unit: "204",
    client: "Maria Oliveira",
    date: new Date(2025, 4, 19, 14, 30),
    type: "inspection",
    status: "confirmed"
  },
  {
    id: "3",
    title: "Atendimento técnico",
    property: "Residencial Bosque Verde",
    unit: "102",
    client: "Roberto Pereira",
    date: new Date(2025, 4, 18, 9, 0),
    type: "warranty",
    status: "completed"
  },
  {
    id: "4",
    title: "Vistoria pré-entrega",
    property: "Condomínio Monte Azul",
    unit: "301",
    client: "Juliana Costa",
    date: new Date(2025, 4, 18, 15, 0),
    type: "inspection",
    status: "confirmed"
  },
  {
    id: "5",
    title: "Atendimento técnico",
    property: "Residencial Bosque Verde",
    unit: "405",
    client: "Fernando Martins",
    date: new Date(2025, 4, 20, 10, 30),
    type: "warranty",
    status: "pending"
  },
  {
    id: "6",
    title: "Entrega de chaves",
    property: "Edifício Aurora",
    unit: "602",
    client: "Luciana Santos",
    date: new Date(2025, 4, 22, 11, 0),
    type: "inspection",
    status: "cancelled"
  },
];
