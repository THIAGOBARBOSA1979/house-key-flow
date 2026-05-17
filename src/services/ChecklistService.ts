
import { SyncService } from './SyncService';
import { auditLogService } from './AuditLogService';

export interface Evidence {
  id: string;
  file?: File;
  url: string;
  thumbnailUrl?: string;
  notes?: string;
  timestamp: Date;
  location?: { lat: number; lng: number };
}

export interface ChecklistItem {
  id: string;
  name?: string;
  description: string;
  required: boolean;
  conditional?: {
    dependsOn: string;
    value: boolean;
  };
  evidence?: Evidence[];
  status?: 'ok' | 'issue' | 'na';
  conformity?: "pending" | "conform" | "nonconform";
  notes?: string;
  severity: "low" | "medium" | "high" | "critical";
  weight?: number; // Peso para o score (1-10)
}

export interface ChecklistGroup {
  id: string;
  name: string;
  description?: string;
  items: ChecklistItem[];
}

export interface ChecklistTemplate {
  id: string;
  title: string;
  description: string;
  category: "vistoria" | "manutencao" | "seguranca" | "hidraulica" | "eletrica" | "entrega" | "pos-venda";
  status: "active" | "draft" | "archived";
  groups: ChecklistGroup[]; 
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
  groups: ChecklistGroup[];
  notes: string;
  status: "completed" | "in_progress" | "canceled";
  score: number; // 0-100 calculado
  conformityRate: number; // Porcentagem de itens OK
  propertyId?: string;
  unitId?: string;
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
  };
  signature?: string;
  clientSignature?: string;
  syncStatus: "synced" | "pending";
}

class ChecklistService {
  private storageKey = "a2_checklist_templates";
  private storageKeyExecutions = "a2_checklist_executions";
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
      groups: [
        {
          id: "g1",
          name: "Acabamentos Internos",
          items: [
            { id: "1", description: "Pintura geral e acabamentos de parede", required: true, severity: "medium" },
            { id: "2", description: "Pisos e rodapés (cerâmica/porcelanato)", required: true, severity: "medium" },
          ]
        },
        {
          id: "g2",
          name: "Sistemas e Esquadrias",
          items: [
            { id: "3", description: "Janelas e vidros (vedação e abertura)", required: true, severity: "high" },
            { id: "4", description: "Portas, fechaduras e dobradiças", required: true, severity: "high" },
          ]
        }
      ]
    }
  ];

  private executions: ChecklistExecutionRecord[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const storedTemplates = localStorage.getItem(this.storageKey);
    if (storedTemplates) {
      try {
        const parsed = JSON.parse(storedTemplates);
        this.templates = parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          lastUpdated: new Date(t.lastUpdated)
        }));
      } catch (e) {
        console.error("Failed to load checklist templates", e);
      }
    }

    const storedExecutions = localStorage.getItem(this.storageKeyExecutions);
    if (storedExecutions) {
      try {
        this.executions = JSON.parse(storedExecutions).map((e: any) => ({
          ...e,
          date: new Date(e.date)
        }));
      } catch (e) {
        console.error("Failed to load checklist executions", e);
      }
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.templates));
  }

  private persistExecutions() {
    localStorage.setItem(this.storageKeyExecutions, JSON.stringify(this.executions));
  }

  getAllTemplates(): ChecklistTemplate[] {
    return this.templates.filter(t => t.status !== 'archived');
  }

  getTemplateById(id: string): ChecklistTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  async createTemplate(template: Omit<ChecklistTemplate, "id" | "createdAt" | "lastUpdated" | "version" | "status">): Promise<ChecklistTemplate> {
    const newTemplate: ChecklistTemplate = {
      ...template,
      id: crypto.randomUUID(),
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

  async updateTemplate(id: string, updates: Partial<ChecklistTemplate>): Promise<ChecklistTemplate | null> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return null;

    // Se o template já tiver execuções, poderíamos criar uma nova versão aqui
    // Para simplificar agora, apenas atualizamos e incrementamos a versão
    const updated = {
      ...this.templates[index],
      ...updates,
      lastUpdated: new Date(),
      version: this.templates[index].version + 1
    };

    this.templates[index] = updated;
    this.persist();
    return updated;
  }

  async archiveTemplate(id: string) {
    return this.updateTemplate(id, { status: 'archived' });
  }

  getAllExecutions(): ChecklistExecutionRecord[] {
    return [...this.executions];
  }

  calculateScore(groups: ChecklistGroup[]): { score: number, conformityRate: number } {
    let totalWeight = 0;
    let earnedWeight = 0;
    let totalItems = 0;
    let okItems = 0;

    const severityWeights = {
      low: 1,
      medium: 3,
      high: 6,
      critical: 10
    };

    groups.forEach(group => {
      group.items.forEach(item => {
        if (item.status === 'na') return;
        
        totalItems++;
        const weight = severityWeights[item.severity] || 1;
        totalWeight += weight;

        if (item.status === 'ok') {
          earnedWeight += weight;
          okItems++;
        }
      });
    });

    return {
      score: totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100,
      conformityRate: totalItems > 0 ? Math.round((okItems / totalItems) * 100) : 100
    };
  }

  logExecution(
    templateId: string, 
    groups: ChecklistGroup[], 
    notes: string, 
    locationInfo?: { propertyId?: string, unitId?: string, lat?: number, lng?: number }, 
    status: "completed" | "in_progress" = "completed"
  ) {
    const template = this.getTemplateById(templateId);
    const { score, conformityRate } = this.calculateScore(groups);

    const newExecution: ChecklistExecutionRecord = {
      id: `exec-${Date.now()}`,
      templateId,
      templateTitle: template?.title || "Checklist Avulso",
      performedBy: "admin-1",
      performedByName: "Administrador",
      date: new Date(),
      groups,
      notes,
      status,
      score,
      conformityRate,
      propertyId: locationInfo?.propertyId,
      unitId: locationInfo?.unitId,
      location: locationInfo?.lat ? { lat: locationInfo.lat, lng: locationInfo.lng } : undefined,
      syncStatus: "synced"
    };

    this.executions.unshift(newExecution);
    this.persistExecutions();

    if (status === "completed") {
      auditLogService.log({
        entityType: 'checklist',
        entityId: templateId,
        action: 'completed',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: `Execução do checklist "${template?.title || templateId}" concluída. Score: ${score}%.`,
        metadata: { notes, score, conformityRate }
      });
    }
    
    return newExecution;
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
