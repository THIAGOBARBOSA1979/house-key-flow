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
