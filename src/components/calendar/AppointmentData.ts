import { inspectionService } from "@/services";
import { Appointment, AppointmentType, AppointmentStatus } from "@/types";


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

// Combine service data and provide as a single exported variable
export const getUnifiedAppointments = (): Appointment[] => {
  const serviceInspections = inspectionService.getAll();
  
  return serviceInspections
    .filter(Boolean)
    .map(mapServiceToAppointment);
};
