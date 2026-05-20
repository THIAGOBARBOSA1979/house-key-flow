import { SupabaseBaseService } from "../SupabaseBaseService";
import { Supabase } from "@/integrations/supabase";
import { Database } from "@/integrations/supabase/types";

export interface ChecklistItem {
  id: string;
  name?: string;
  completed?: boolean;
  notes?: string;
  description?: string;
  required?: boolean;
  severity?: "low" | "medium" | "high" | "critical";
  status?: "pending" | "conform" | "non_conform" | "not_applicable" | "ok" | "issue" | "na" | "nonconform";
  evidence?: any[];
  conformity?: "conform" | "non_conform" | "not_applicable" | "pending" | "nonconform";
  abntReference?: string; // Ex: NBR 15575-3:2013
  inspectionMethod?: string; // Visual, Percussão, etc.
}

export interface ChecklistGroup {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface ChecklistTemplate {
  id: string;
  company_id?: string;
  title: string;
  description: string;
  category: string;
  groups: ChecklistGroup[];
  createdAt?: Date;
  lastUpdated?: Date;
  version?: number;
}

export interface ChecklistExecutionRecord {
  id: string;
  company_id?: string;
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
  { 
    id: "1", 
    company_id: 'comp-1',
    title: "Entrega de Chaves", 
    description: "Verificação final", 
    category: "vistoria", 
    groups: [],
    createdAt: new Date(),
    lastUpdated: new Date(),
    version: 1
  }
];

class ChecklistService extends SupabaseBaseService<ChecklistTemplate> {
  private executions: ChecklistExecutionRecord[] = [];

  constructor() {
    super({
      storageKey: "a2_checklist_templates",
      supabaseTable: "audit_logs" as keyof Database['public']['Tables'], // Dummy table
      auditEntityType: "checklist",
      shouldSyncWithSupabase: false
    }, INITIAL_TEMPLATES);
    this.loadExecutions();
  }

  private loadExecutions() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem("a2_checklist_executions");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.executions = parsed.map((e: any) => ({ 
          ...e, 
          date: new Date(e.date) 
        }));
      } catch (e) {
        console.error("Error loading executions", e);
      }
    }
  }

  private persistExecutions() {
    if (typeof window === 'undefined') return;
    localStorage.setItem("a2_checklist_executions", JSON.stringify(this.executions));
  }

  getAllTemplates() { return this.getAll(); }
  getTemplateById(id: string) { return this.getById(id); }
  getAllExecutions() { return [...this.executions]; }

  async createTemplate(data: Omit<ChecklistTemplate, "id">) { 
    return this.create({ 
      ...data, 
      createdAt: new Date(), 
      lastUpdated: new Date(), 
      version: 1 
    }); 
  }

  archiveTemplate(id: string) { 
    return this.delete(id); 
  }


  logExecution(templateId: string, groups: ChecklistGroup[], notes: string, name: string = "Admin", status: ChecklistExecutionRecord["status"] = "completed") {
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
    this.persistExecutions();
    return record;
  }
}

export const checklistService = new ChecklistService();
