export interface PropertyMilestone {
  id: string;
  title: string;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface PropertyUnit {
  id: string;
  number: string;
  floor?: string;
  status: "available" | "sold" | "delivered";
  type?: string;
}

export interface Property {
  id: string;
  company_id?: string;

  name: string;
  location: string;
  units: number;
  completedUnits: number;
  status: "pending" | "progress" | "complete";
  imageUrl?: string;
  description?: string;
  totalArea?: number;
  deliveryDate?: Date;
  manager?: string;
  milestones?: PropertyMilestone[];
  unitsList?: PropertyUnit[];
  createdAt?: Date;
}

export interface PropertyMetrics {
  total: number;
  byStatus: Record<string, number>;
  totalUnits: number;
  totalCompleted: number;
  averageProgress: number;
}
