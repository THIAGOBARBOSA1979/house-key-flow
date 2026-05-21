import { BaseService } from "../BaseService";
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
  photos?: string[];
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

// Removed INITIAL_TEMPLATES mock data


class ChecklistService extends SupabaseBaseService<ChecklistTemplate> {
  private executions: ChecklistExecutionRecord[] = [];

  constructor() {
    super({
      storageKey: "a2_checklist_templates",
      supabaseTable: "checklist_templates",
      auditEntityType: "checklist",
      shouldSyncWithSupabase: true
    });
  }


  private loadExecutions() {
    // Disabled
  }

  private persistExecutions() {
    // Disabled
  }

  async getAllTemplates() { return await this.getAll(); }
  getAllTemplatesSync() { return this.getAllSync(); }
  async getTemplateById(id: string) { return await this.getById(id); }
  getTemplateByIdSync(id: string) { return this.getByIdSync(id); }
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
    // this.persistExecutions(); // Disabled
    this.notify();
    return record;
  }
}

export const checklistService = new ChecklistService();
