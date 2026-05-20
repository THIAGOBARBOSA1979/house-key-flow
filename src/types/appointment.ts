
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
