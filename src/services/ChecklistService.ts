

import { SyncService } from './SyncService';
import { auditLogService } from './AuditLogService';

export interface ChecklistItem {
  id: string;
  name?: string; // Standardized name field
  description: string;
  required: boolean;
  conditional?: {
    dependsOn: string;
    value: boolean;
  };
  evidence?: any[];
  status?: 'ok' | 'issue' | 'na';
  conformity?: "pending" | "conform" | "nonconform"; // Standardized conformity field
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
  category: "vistoria" | "manutencao" | "seguranca" | "hidraulica" | "eletrica" | "entrega" | "pos-venda";
  status: "active" | "draft" | "archived";
  items?: ChecklistItem[]; 
  groups?: ChecklistGroup[]; 
  createdAt: Date;
  lastUpdated: Date;
  version: number;
}

export interface ChecklistExecutionRecord {
  id: string;
  templateId: string;
  templateTitle: string;
  performedBy: string;
  performedByName: string;
  date: Date;
  items: ChecklistItem[];
  notes: string;
  status: "completed" | "in_progress" | "canceled";
  conformityRate: number;
  location?: {
    property?: string;
    unit?: string;
  };
}

class ChecklistService {
  private templates: ChecklistTemplate[] = [
    {
      id: "checklist1",
      title: "Checklist Padrão - Entrega de Apartamento",
      description: "Verificação completa para entrega de unidades residenciais",
      category: "entrega",
      status: "active",
      createdAt: new Date(2025, 4, 1),
      lastUpdated: new Date(2025, 4, 1),
      version: 1,
      items: [
        { id: "1", description: "Acabamento: Pintura geral e acabamentos de parede", required: true },
        { id: "2", description: "Acabamento: Pisos e rodapés (cerâmica/porcelanato)", required: true },
        { id: "3", description: "Esquadrias: Janelas e vidros", required: true },
        { id: "4", description: "Esquadrias: Portas, fechaduras e dobradiças", required: true },
        { id: "5", description: "Hidráulica: Louças e metais sanitários", required: true },
        { id: "6", description: "Elétrica: Instalações elétricas (tomadas e pontos)", required: true },
        { id: "7", description: "Outros: Limpeza fina da unidade", required: true },
      ]
    },
    {
      id: "checklist2",
      title: "Checklist Verificação Hidráulica",
      description: "Foco em instalações hidráulicas, torneiras, válvulas e escoamento",
      category: "hidraulica",
      status: "active",
      createdAt: new Date(2025, 4, 5),
      lastUpdated: new Date(2025, 4, 5),
      version: 1,
      items: [
        { id: "h1", description: "Hidráulica: Teste de estanqueidade de ramais", required: true },
        { id: "h2", description: "Hidráulica: Vazão de água em torneiras e chuveiros", required: true },
        { id: "h3", description: "Hidráulica: Escoamento de ralos e bacias", required: true },
        { id: "h4", description: "Hidráulica: Acabamento de registros", required: true },
      ]
    }
  ];

  private executions: ChecklistExecutionRecord[] = [
    {
      id: "exec1",
      templateId: "checklist1",
      templateTitle: "Vistoria Pré-Entrega - Unidade 204",
      performedBy: "user1",
      performedByName: "Roberto Santos",
      date: new Date(),
      status: "completed",
      conformityRate: 100,
      notes: "Tudo em ordem para entrega.",
      items: [],
      location: { unit: "204" }
    }
  ];

  private storageKey = "a2_checklist_templates";

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.templates = parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          lastUpdated: new Date(t.lastUpdated)
        }));
      } catch (e) {
        console.error("Failed to load checklist templates", e);
      }
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.templates));
  }

  getAllTemplates(): ChecklistTemplate[] {
    return [...this.templates];
  }

  getTemplateById(id: string): ChecklistTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  async createTemplate(template: Omit<ChecklistTemplate, "id" | "createdAt" | "lastUpdated" | "version" | "status">): Promise<ChecklistTemplate> {
    const newTemplate: ChecklistTemplate = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
      status: "active",
      version: 1,
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
    this.templates.push(newTemplate);
    this.persist();
    auditLogService.log({
      entityType: 'checklist',
      entityId: newTemplate.id,
      action: 'created',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Template de checklist "${newTemplate.title}" criado.`
    });
    return newTemplate;
  }

  getAllExecutions(): ChecklistExecutionRecord[] {
    return [...this.executions];
  }

  logExecution(templateId: string, items: ChecklistItem[], notes: string, location?: { property?: string, unit?: string }) {
    const template = this.getTemplateById(templateId);
    const okCount = items.filter(i => i.status === 'ok').length;
    const totalCount = items.length;
    const conformityRate = totalCount > 0 ? (okCount / totalCount) * 100 : 0;

    const newExecution: ChecklistExecutionRecord = {
      id: `exec-${Date.now()}`,
      templateId,
      templateTitle: template?.title || "Checklist Avulso",
      performedBy: "admin-1",
      performedByName: "Administrador",
      date: new Date(),
      items,
      notes,
      status: "completed",
      conformityRate,
      location
    };

    this.executions.unshift(newExecution);
    this.persistExecutions();

    auditLogService.log({
      entityType: 'checklist',
      entityId: templateId,
      action: 'completed',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Execução do checklist "${template?.title || templateId}" concluída. (${okCount}/${totalCount} OK).`,
      metadata: { notes, okCount, totalCount, conformityRate }
    });
  }

  static async signChecklist(checklistId: string, signature: any) {
    const signatureData = {
      checklistId,
      signature,
      timestamp: new Date().toISOString(),
    };
    return await SyncService.syncData(`checklists/${checklistId}/sign`, signatureData, 'POST');
  }
}

export const checklistService = new ChecklistService();

