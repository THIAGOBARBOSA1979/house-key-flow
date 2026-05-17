
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
  category: "contrato" | "manual" | "relatorio" | "certificado" | "outros" | "financeiro" | "projeto" | "legal" | "seguranca";
  folderId?: string;
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
  status: "draft" | "published" | "archived" | "trash";
  approvalStatus: "pending" | "approved" | "rejected";
  approvalComment?: string;
  approvalHistory?: ApprovalHistoryEntry[];
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
  deletedAt?: Date;
  attachments?: DocumentAttachment[];
  viewCount: number;
  viewers?: string[];
  signatures?: DocumentSignature[];
  isSigned?: boolean;
  signedUrl?: string;
  validUntil?: Date;
}

export interface DocumentSignature {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "pending" | "signed" | "rejected";
  signedAt?: Date;
  ipAddress?: string;
  confirmationMethod: "email" | "sms" | "govbr" | "facial";
  order?: number; 
  documentHash?: string;
  evidence?: {
    browser?: string;
    os?: string;
    location?: string;
    lat?: number;
    lng?: number;
    facialMatchScore?: number;
    tokenSms?: string;
  };
  rejectionReason?: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  status: "pending" | "approved" | "rejected";
  comment?: string;
  performedBy: string;
  performedAt: Date;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
  createdAt: Date;
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
      title: "Contrato de Compra e Venda - Unidade 204",
      type: "auto",
      category: "contrato",
      folderId: "f1",
      viewCount: 45,
      isSigned: false,
      template: `CONTRATO DE COMPRA E VENDA - RESIDENCIAL AURORA`,
      associatedTo: { client: "João Silva", property: "Edifício Aurora", unit: "204" },
      visible: true,
      createdAt: new Date(2025, 4, 10),
      updatedAt: new Date(2025, 4, 10),
      downloads: 5,
      status: "published",
      approvalStatus: "approved",
      tags: ["contrato", "venda", "unidade-204"],
      isFavorite: true,
      version: 1,
      priority: "high",
      description: "Contrato principal de aquisição da unidade 204",
      createdBy: "Admin",
      approvedBy: "Diretoria",
      approvedAt: new Date(2025, 4, 10)
    }
  ];

  private storageKey = "a2_documents";

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.documents = parsed.map((d: any) => ({
          ...d,
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt),
          expiresAt: d.expiresAt ? new Date(d.expiresAt) : undefined,
          validUntil: d.validUntil ? new Date(d.validUntil) : undefined,
          deletedAt: d.deletedAt ? new Date(d.deletedAt) : undefined,
          approvedAt: d.approvedAt ? new Date(d.approvedAt) : undefined,
        }));
      } catch (e) {
        console.error("Failed to load documents", e);
      }
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.documents));
  }

  getAllDocuments(): Document[] {
    return [...this.documents];
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

  getCategories(): DocumentCategory[] {
    return [
      { id: "contrato", name: "Contratos", description: "Contratos e acordos comerciais", icon: "FileText", color: "blue" },
      { id: "manual", name: "Manuais", description: "Manuais de uso e guias técnicos", icon: "Book", color: "green" },
      { id: "relatorio", name: "Relatórios", description: "Relatórios e laudos de vistoria", icon: "BarChart", color: "purple" },
      { id: "certificado", name: "Certificados", description: "Certidões, alvarás e documentos oficiais", icon: "Award", color: "orange" },
      { id: "projeto", name: "Projetos", description: "Plantas e projetos arquitetônicos", icon: "Layout", color: "cyan" },
      { id: "financeiro", name: "Financeiro", description: "Comprovantes e notas fiscais", icon: "DollarSign", color: "emerald" },
      { id: "legal", name: "Documentos Legais", description: "Escrituras, alvarás e licenças municipais", icon: "Shield", color: "red" },
      { id: "seguranca", name: "Segurança", description: "Certificados de segurança e brigada de incêndio", icon: "HardHat", color: "amber" },
      { id: "outros", name: "Outros", description: "Outros documentos diversos", icon: "File", color: "gray" }
    ];
  }

  searchDocuments(term: string, filters: any): Document[] {
    return this.documents.filter(doc => {
      const matchesSearch = !term || doc.title.toLowerCase().includes(term.toLowerCase()) || 
                          doc.fileName?.toLowerCase().includes(term.toLowerCase());
      const matchesCategory = !filters.category || doc.category === filters.category;
      const matchesStatus = !filters.status || doc.status === filters.status;
      const matchesPriority = !filters.priority || doc.priority === filters.priority;
      const matchesFolder = !filters.folderId || doc.folderId === filters.folderId;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesFolder;
    });
  }

  createDocument(data: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'downloads' | 'version' | 'approvalStatus' | 'viewCount' | 'isSigned'>): Document {
    const newDocument: Document = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      downloads: 0,
      version: 1,
      approvalStatus: 'pending',
      viewCount: 0,
      isSigned: false
    };
    
    this.documents.push(newDocument);
    this.persist();
    auditLogService.log({
      entityType: 'document',
      entityId: newDocument.id,
      action: 'created',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Documento ${newDocument.title} criado.`
    });
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

    if (hasContentChanges) {
      const versionEntry: DocumentVersion = {
        id: crypto.randomUUID(),
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

    this.persist();
    return this.documents[index];
  }

  deleteDocument(id: string): boolean {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) return false;

    const doc = this.documents[index];
    
    if (doc.status !== 'trash') {
      this.updateDocument(id, { 
        status: 'trash', 
        deletedAt: new Date() 
      });
      return true;
    }

    this.documents.splice(index, 1);
    this.persist();
    return true;
  }

  logView(id: string, userId: string = 'user-current'): void {
    const doc = this.getDocumentById(id);
    if (!doc) return;

    const viewers = doc.viewers || [];
    if (!viewers.includes(userId)) {
      viewers.push(userId);
    }

    this.updateDocument(id, { 
      viewCount: (doc.viewCount || 0) + 1,
      viewers 
    });
  }

  downloadDocument(id: string) {
    const doc = this.getDocumentById(id);
    if (doc) {
      this.updateDocument(id, { downloads: (doc.downloads || 0) + 1 });
    }
  }

  shareDocument(id: string): string {
    return `${window.location.origin}/share/doc/${id}`;
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
    
    auditLogService.log({
      entityType: 'document',
      entityId: id,
      action: 'updated',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Documento "${document.title}" ${!document.isFavorite ? 'marcado como favorito' : 'removido dos favoritos'}.`
    });
    return true;
  }

  duplicateDocument(id: string): Document | null {
    const doc = this.getDocumentById(id);
    if (!doc) return null;
    
    const { id: _, ...data } = doc;
    return this.createDocument({
      ...data,
      title: `${doc.title} (Cópia)`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);
  }

  restoreDocument(id: string): boolean {
    const doc = this.getDocumentById(id);
    if (!doc || doc.status !== 'trash') return false;

    this.updateDocument(id, { 
      status: 'published',
      deletedAt: undefined 
    });
    return true;
  }

  moveDocument(id: string, folderId: string | undefined): boolean {
    const doc = this.getDocumentById(id);
    if (!doc) return false;

    this.updateDocument(id, { folderId });
    return true;
  }

  getDocumentStats() {
    return {
      total: this.documents.length,
      published: this.documents.filter(d => d.status === 'published').length,
      draft: this.documents.filter(d => d.status === 'draft').length,
      archived: this.documents.filter(d => d.status === 'archived').length,
      expiring: this.getExpiringDocuments(30).length,
      favorites: this.getFavoriteDocuments().length,
      byCategory: this.documents.reduce((acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: this.documents.reduce((acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalDownloads: this.documents.reduce((acc, doc) => acc + (doc.downloads || 0), 0),
      totalViews: this.documents.reduce((acc, doc) => acc + (doc.viewCount || 0), 0),
    };
  }

  getFolderStructure() {
    return [
      { id: "f1", name: "Contratos", icon: "Folder", parentId: null },
      { id: "f2", name: "Laudos Técnicos", icon: "Folder", parentId: null },
      { id: "f3", name: "Projetos", icon: "Folder", parentId: null }
    ];
  }

  getSignatureHistory(id: string) {
    const doc = this.getDocumentById(id);
    return doc?.signatures || [];
  }

  addSigner(id: string, signer: Omit<DocumentSignature, "id" | "status">): DocumentSignature | null {
    const doc = this.getDocumentById(id);
    if (!doc) return null;
    
    const newSigner: DocumentSignature = {
      ...signer,
      id: crypto.randomUUID(),
      status: "pending"
    };
    
    const signatures = [...(doc.signatures || []), newSigner];
    this.updateDocument(id, { signatures });
    return newSigner;
  }

  signDocument(id: string, signerId: string, method?: string, evidence?: any) {
    const doc = this.getDocumentById(id);
    if (!doc || !doc.signatures) return false;
    
    const signatures = doc.signatures.map(s => 
      s.id === signerId ? { 
        ...s, 
        status: "signed" as const, 
        signedAt: new Date(),
        confirmationMethod: (method as any) || s.confirmationMethod,
        evidence: { ...s.evidence, ...evidence }
      } : s
    );
    
    const allSigned = signatures.every(s => s.status === "signed");
    return this.updateDocument(id, { signatures, isSigned: allSigned });
  }

  rejectSignature(id: string, signerId: string, reason: string) {
    const doc = this.getDocumentById(id);
    if (!doc || !doc.signatures) return false;
    
    const signatures = doc.signatures.map(s => 
      s.id === signerId ? { ...s, status: "rejected" as const, rejectionReason: reason } : s
    );
    
    return this.updateDocument(id, { signatures });
  }

  generateDocument(templateId: string, data: any): string {
    const doc = this.getDocumentById(templateId);
    if (!doc || !doc.template) return "";
    
    let content = doc.template;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, data[key]);
    });
    
    return content;
  }
}

export const documentService = new DocumentService();
