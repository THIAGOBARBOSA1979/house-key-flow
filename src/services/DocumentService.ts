
import { v4 as uuidv4 } from 'uuid';
import { auditLogService } from './AuditLogService';

export interface Document {
  id: string;
  title: string;
  type: "auto" | "manual";
  template?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  category: "contrato" | "manual" | "relatorio" | "certificado" | "outros";
  associatedTo: {
    client?: string;
    property?: string;
    unit?: string;
    phase?: string;
  };
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
  downloads: number;
  status: "draft" | "published" | "archived";
  tags?: string[];
  isFavorite?: boolean;
  version: number;
  versionHistory?: DocumentVersion[];
  expiresAt?: Date;
  priority: "low" | "medium" | "high";
  description?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface DocumentVersion {
  id: string;
  version: number;
  title: string;
  template?: string;
  createdAt: Date;
  createdBy: string;
  changes: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  type: "text" | "number" | "date" | "boolean";
  required: boolean;
  defaultValue?: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

class DocumentService {
  private documents: Document[] = [
    {
      id: "1",
      title: "Contrato de Compra e Venda",
      type: "auto",
      category: "contrato",
      template: `CONTRATO DE COMPRA E VENDA

VENDEDOR: A2 Incorporadora LTDA
COMPRADOR: {{nome_cliente}}
IMÓVEL: {{endereco}}
EMPREENDIMENTO: {{empreendimento}}
VALOR: R$ {{valor}}
DATA: {{data}}

Este contrato estabelece as condições de venda do imóvel acima descrito.`,
      associatedTo: { client: "João Silva", property: "Edifício Aurora", unit: "101" },
      visible: true,
      createdAt: new Date(2025, 4, 10),
      updatedAt: new Date(2025, 4, 10),
      downloads: 5,
      status: "published",
      tags: ["contrato", "venda"],
      isFavorite: false,
      version: 1,
      priority: "high",
      description: "Contrato padrão para venda de imóveis",
      createdBy: "Admin",
      approvedBy: "Supervisor",
      approvedAt: new Date(2025, 4, 10)
    },
    {
      id: "2", 
      title: "Manual do Proprietário",
      type: "manual",
      category: "manual",
      fileUrl: "/docs/manual-proprietario.pdf",
      fileName: "manual-proprietario.pdf",
      fileSize: "850 KB",
      associatedTo: { property: "Edifício Aurora" },
      visible: true,
      createdAt: new Date(2025, 4, 12),
      updatedAt: new Date(2025, 4, 12),
      downloads: 12,
      status: "published",
      tags: ["manual", "proprietário"],
      isFavorite: true,
      version: 2,
      priority: "medium",
      description: "Manual completo para proprietários",
      createdBy: "Admin"
    },
    {
      id: "3",
      title: "Relatório de Vistoria",
      type: "auto",
      category: "relatorio",
      template: `RELATÓRIO DE VISTORIA

CLIENTE: {{nome_cliente}}
IMÓVEL: {{endereco}}
DATA DA VISTORIA: {{data_vistoria}}
RESPONSÁVEL: {{responsavel_vistoria}}

ITENS VERIFICADOS:
- Estado geral do imóvel: {{estado_geral}}
- Instalações elétricas: {{instalacoes_eletricas}}
- Instalações hidráulicas: {{instalacoes_hidraulicas}}

OBSERVAÇÕES: {{observacoes}}`,
      associatedTo: { client: "Maria Santos", property: "Residencial Bosque", unit: "205" },
      visible: true,
      createdAt: new Date(2025, 4, 15),
      updatedAt: new Date(2025, 4, 15),
      downloads: 3,
      status: "published",
      tags: ["vistoria", "relatório"],
      isFavorite: false,
      version: 1,
      priority: "low",
      description: "Relatório detalhado de vistoria",
      createdBy: "Inspetor",
      expiresAt: new Date(2025, 10, 15)
    }
  ];

  private categories: DocumentCategory[] = [
    { id: "contrato", name: "Contratos", description: "Contratos e acordos", icon: "FileText", color: "blue" },
    { id: "manual", name: "Manuais", description: "Manuais e guias", icon: "Book", color: "green" },
    { id: "relatorio", name: "Relatórios", description: "Relatórios e laudos", icon: "BarChart", color: "purple" },
    { id: "certificado", name: "Certificados", description: "Certificados e documentos oficiais", icon: "Award", color: "orange" },
    { id: "outros", name: "Outros", description: "Outros documentos", icon: "File", color: "gray" }
  ];

  private templateVariables: TemplateVariable[] = [
    { key: "nome_cliente", label: "Nome do Cliente", description: "Nome completo do cliente", type: "text", required: true },
    { key: "endereco", label: "Endereço", description: "Endereço completo do imóvel", type: "text", required: true },
    { key: "valor", label: "Valor", description: "Valor do imóvel", type: "text", required: true },
    { key: "data", label: "Data", description: "Data atual", type: "date", required: true },
    { key: "empreendimento", label: "Empreendimento", description: "Nome do empreendimento", type: "text", required: false },
    { key: "data_vistoria", label: "Data da Vistoria", description: "Data de realização da vistoria", type: "date", required: true },
    { key: "responsavel_vistoria", label: "Responsável Vistoria", description: "Nome do responsável pela vistoria", type: "text", required: true },
    { key: "estado_geral", label: "Estado Geral", description: "Estado geral do imóvel", type: "text", required: false },
    { key: "instalacoes_eletricas", label: "Instalações Elétricas", description: "Estado das instalações elétricas", type: "text", required: false },
    { key: "instalacoes_hidraulicas", label: "Instalações Hidráulicas", description: "Estado das instalações hidráulicas", type: "text", required: false },
    { key: "observacoes", label: "Observações", description: "Observações gerais", type: "text", required: false }
  ];

  getAllDocuments(): Document[] {
    return this.documents;
  }

  getDocumentById(id: string): Document | undefined {
    return this.documents.find(doc => doc.id === id);
  }

  getDocumentsByClient(clientName: string): Document[] {
    return this.documents.filter(doc => 
      doc.visible && 
      (doc.associatedTo.client === clientName || !doc.associatedTo.client)
    );
  }

  getDocumentsByCategory(category: string): Document[] {
    return this.documents.filter(doc => doc.category === category);
  }

  getFavoriteDocuments(): Document[] {
    return this.documents.filter(doc => doc.isFavorite);
  }

  getExpiringDocuments(days: number = 30): Document[] {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.documents.filter(doc => 
      doc.expiresAt && doc.expiresAt <= futureDate
    );
  }

  createDocument(data: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'downloads' | 'version'>): Document {
    const newDocument: Document = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      downloads: 0,
      version: 1
    };
    
    this.documents.push(newDocument);
    auditLogService.log({
      entityType: 'document',
      entityId: newDocument.id,
      action: 'created',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Documento ${newDocument.title} criado.`
    });
    console.log('DocumentService: Documento criado:', newDocument.title);
    return newDocument;
  }

  updateDocument(id: string, data: Partial<Document>): Document | null {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) return null;

    const oldDocument = this.documents[index];
    const hasContentChanges = data.template && data.template !== oldDocument.template;

    this.documents[index] = {
      ...oldDocument,
      ...data,
      updatedAt: new Date(),
      version: hasContentChanges ? oldDocument.version + 1 : oldDocument.version
    };

    // Criar entrada no histórico de versões se houve mudanças no conteúdo
    if (hasContentChanges) {
      const versionEntry: DocumentVersion = {
        id: uuidv4(),
        version: oldDocument.version,
        title: oldDocument.title,
        template: oldDocument.template,
        createdAt: new Date(),
        createdBy: data.createdBy || 'Sistema',
        changes: 'Atualização do template'
      };

      if (!this.documents[index].versionHistory) {
        this.documents[index].versionHistory = [];
      }
      this.documents[index].versionHistory!.push(versionEntry);
    }

    console.log('DocumentService: Documento atualizado:', this.documents[index].title);
    return this.documents[index];
  }

  deleteDocument(id: string): boolean {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) return false;

    console.log('DocumentService: Documento excluído:', this.documents[index].title);
    this.documents.splice(index, 1);
    return true;
  }

  deleteMultipleDocuments(ids: string[]): number {
    let deletedCount = 0;
    ids.forEach(id => {
      if (this.deleteDocument(id)) {
        deletedCount++;
      }
    });
    return deletedCount;
  }

  toggleFavorite(id: string): boolean {
    const document = this.getDocumentById(id);
    if (!document) return false;

    this.updateDocument(id, { isFavorite: !document.isFavorite });
    return true;
  }

  duplicateDocument(id: string): Document | null {
    const original = this.getDocumentById(id);
    if (!original) return null;

    const duplicate = this.createDocument({
      ...original,
      title: `${original.title} (Cópia)`,
      status: 'draft',
      isFavorite: false,
      createdBy: 'Sistema'
    });

    return duplicate;
  }

  generateDocument(documentId: string, variables: Record<string, string>): string {
    const document = this.getDocumentById(documentId);
    if (!document || !document.template) {
      throw new Error('Documento ou template não encontrado');
    }

    let generatedContent = document.template;
    
    // Substituir variáveis no template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      generatedContent = generatedContent.replace(regex, value);
    });

    // Incrementar contador de downloads
    this.updateDocument(documentId, { downloads: document.downloads + 1 });

    console.log('DocumentService: Documento gerado:', document.title);
    return generatedContent;
  }

  downloadDocument(documentId: string): void {
    const document = this.getDocumentById(documentId);
    if (!document) {
      throw new Error('Documento não encontrado');
    }

    // Incrementar contador de downloads
    this.updateDocument(documentId, { downloads: document.downloads + 1 });

    if (document.type === 'manual' && document.fileUrl) {
      // Simular download de arquivo usando window.document ao invés de document
      const link = window.document.createElement('a');
      link.href = document.fileUrl;
      link.download = document.fileName || document.title;
      link.click();
    }

    console.log('DocumentService: Download realizado:', document.title);
  }

  getTemplateVariables(): TemplateVariable[] {
    return this.templateVariables;
  }

  getCategories(): DocumentCategory[] {
    return this.categories;
  }

  getDocumentStats() {
    return {
      total: this.documents.length,
      published: this.documents.filter(d => d.status === 'published').length,
      draft: this.documents.filter(d => d.status === 'draft').length,
      archived: this.documents.filter(d => d.status === 'archived').length,
      favorites: this.documents.filter(d => d.isFavorite).length,
      expiring: this.getExpiringDocuments().length,
      byCategory: this.categories.map(cat => ({
        category: cat.name,
        count: this.getDocumentsByCategory(cat.id).length
      }))
    };
  }

  uploadFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      // Simular upload de arquivo
      setTimeout(() => {
        const fileUrl = `/uploads/${file.name}`;
        console.log('DocumentService: Arquivo enviado:', file.name);
        resolve(fileUrl);
      }, 1000);
    });
  }

  searchDocuments(query: string, filters?: {
    category?: string;
    status?: string;
    priority?: string;
    dateRange?: { from: Date; to: Date };
  }): Document[] {
    let filtered = this.documents;

    // Filtro de busca por texto
    if (query) {
      const searchQuery = query.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery) ||
        doc.description?.toLowerCase().includes(searchQuery) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }

    // Aplicar filtros
    if (filters?.category) {
      filtered = filtered.filter(doc => doc.category === filters.category);
    }
    
    if (filters?.status) {
      filtered = filtered.filter(doc => doc.status === filters.status);
    }
    
    if (filters?.priority) {
      filtered = filtered.filter(doc => doc.priority === filters.priority);
    }
    
    if (filters?.dateRange) {
      filtered = filtered.filter(doc => 
        doc.createdAt >= filters.dateRange!.from && 
        doc.createdAt <= filters.dateRange!.to
      );
    }

    return filtered;
  }
}

export const documentService = new DocumentService();
