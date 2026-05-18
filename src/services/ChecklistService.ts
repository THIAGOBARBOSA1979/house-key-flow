import { BaseService } from "./BaseService";

export interface ChecklistItem {
  id: string;
  name: string;
  completed: boolean;
  notes?: string;
}

export interface ChecklistGroup {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface ChecklistTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  groups: ChecklistGroup[];
}

export interface ChecklistExecutionRecord {
  id: string;
  templateId: string;
  templateTitle: string;
  date: Date;
  performedByName: string;
  groups: ChecklistGroup[];
  notes?: string;
  status: "in_progress" | "completed";
  conformityRate: number;
}

const INITIAL_TEMPLATES: ChecklistTemplate[] = [
  { id: "1", title: "Entrega de Chaves", description: "Verificação final", category: "vistoria", groups: [] }
];

class ChecklistService extends BaseService<ChecklistTemplate> {
  private executions: ChecklistExecutionRecord[] = [];

  constructor() {
    super("a2_checklist_templates", INITIAL_TEMPLATES);
    const stored = localStorage.getItem("a2_checklist_executions");
    if (stored) this.executions = JSON.parse(stored).map((e: any) => ({ ...e, date: new Date(e.date) }));
  }

  getAllTemplates() { return [...this.items]; }
  getAllExecutions() { return [...this.executions]; }

  async createTemplate(data: any) { return this.create(data); }

  logExecution(templateId: string, groups: ChecklistGroup[], notes: string, name: string = "Admin", status: any = "completed") {
    const template = this.getById(templateId);
    const record: ChecklistExecutionRecord = {
      id: crypto.randomUUID(),
      templateId,
      templateTitle: template?.title || "Checklist",
      date: new Date(),
      performedByName: name,
      groups,
      notes,
      status,
      conformityRate: 100
    };
    this.executions.unshift(record);
    localStorage.setItem("a2_checklist_executions", JSON.stringify(this.executions));
    return record;
  }
}

export const checklistService = new ChecklistService();
