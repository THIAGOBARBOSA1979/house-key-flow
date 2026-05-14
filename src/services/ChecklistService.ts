

import { SyncService } from './SyncService';

export interface ChecklistItem {
  id: string;
  description: string;
  required: boolean;
  conditional?: {
    dependsOn: string;
    value: boolean;
  };
  evidence?: any[];
  status?: 'ok' | 'issue' | 'na';
}

export interface ChecklistTemplate {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
  createdAt: Date;
  lastUpdated: Date;
}

class ChecklistService {
  private templates: ChecklistTemplate[] = [
    {
      id: "checklist1",
      title: "Checklist Padrão - Entrega de Apartamento",
      description: "Verificação completa para entrega de unidades residenciais",
      createdAt: new Date(),
      lastUpdated: new Date(),
      items: [
        { id: "1", description: "Pintura geral e acabamentos de parede", required: true },
        { id: "2", description: "Pisos e rodapés (cerâmica/porcelanato)", required: true },
        { id: "3", description: "Esquadrias, janelas e vidros", required: true },
        { id: "4", description: "Portas, fechaduras e dobradiças", required: true },
        { id: "5", description: "Louças e metais sanitários", required: true },
        { id: "6", description: "Instalações elétricas (tomadas e pontos)", required: true },
        { id: "7", description: "Limpeza fina da unidade", required: true },
      ]
    },
    {
      id: "checklist2",
      title: "Checklist Verificação Hidráulica",
      description: "Foco em instalações hidráulicas, torneiras, válvulas e escoamento",
      createdAt: new Date(),
      lastUpdated: new Date(),
      items: [
        { id: "h1", description: "Teste de estanqueidade de ramais", required: true },
        { id: "h2", description: "Vazão de água em torneiras e chuveiros", required: true },
        { id: "h3", description: "Escoamento de ralos e bacias", required: true },
        { id: "h4", description: "Acabamento de registros", required: true },
      ]
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

  async createTemplate(template: Omit<ChecklistTemplate, "id" | "createdAt" | "lastUpdated">): Promise<ChecklistTemplate> {
    const newTemplate: ChecklistTemplate = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
    this.templates.push(newTemplate);
    this.persist();
    return newTemplate;
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

