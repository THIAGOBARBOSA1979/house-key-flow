import { BaseService } from "./BaseService";
import { auditLogService } from "./AuditLogService";

export interface DocumentSignature {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "pending" | "signed" | "rejected";
  signedAt?: Date;
  confirmationMethod: "email" | "sms" | "govbr" | "facial";
}

export interface ApprovalHistoryEntry {
  id: string;
  status: "pending" | "approved" | "rejected";
  comment?: string;
  performedBy: string;
  performedAt: Date;
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

export interface Document {
  id: string;
  title: string;
  type: "auto" | "manual";
  category: string;
  status: "draft" | "published" | "archived" | "trash";
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
  downloads: number;
  viewCount: number;
  associatedTo: {
    client?: string;
    property?: string;
    unit?: string;
  };
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  tags?: string[];
  isFavorite?: boolean;
  template?: string;
  signatures?: DocumentSignature[];
  versionHistory?: DocumentVersion[];
  version: number;
  approvalStatus: "pending" | "approved" | "rejected";
  approvalHistory?: ApprovalHistoryEntry[];
  approvedBy?: string;
  approvedAt?: Date;
  approvalComment?: string;
  createdBy?: string;
}

const INITIAL_DOCUMENTS: Document[] = [
  {
    id: "1",
    title: "Contrato de Compra e Venda - Unidade 204",
    type: "auto",
    category: "contrato",
    associatedTo: { client: "João Silva", property: "Edifício Aurora", unit: "204" },
    visible: true,
    createdAt: new Date(2025, 4, 10),
    updatedAt: new Date(2025, 4, 10),
    downloads: 5,
    viewCount: 45,
    status: "published",
    isFavorite: true,
    version: 1,
    approvalStatus: "approved",
    template: "Contrato de exemplo",
    signatures: [],
    createdBy: "Admin"
  },
];

class DocumentService extends BaseService<Document> {
  constructor() {
    super("a2_documents", INITIAL_DOCUMENTS);
  }

  protected loadFromStorage() {
    super.loadFromStorage();
    this.items = this.items.map(d => ({
      ...d,
      createdAt: new Date(d.createdAt),
      updatedAt: new Date(d.updatedAt),
    }));
  }

  getAllDocuments(): Document[] { return [...this.items]; }
  getDocumentById(id: string): Document | undefined { return this.getById(id); }
  getDocumentsByClient(clientName: string): Document[] { return this.items.filter(doc => doc.associatedTo.client === clientName); }
  getFavoriteDocuments(): Document[] { return this.items.filter(doc => doc.isFavorite); }
  getExpiringDocuments(): Document[] { return []; }

  searchDocuments(term: string, filters: any): Document[] {
    return this.items.filter(doc => {
      const matchesSearch = !term || doc.title.toLowerCase().includes(term.toLowerCase());
      const matchesCategory = !filters.category || filters.category === 'all' || doc.category === filters.category;
      return matchesSearch && matchesCategory;
    });
  }

  createDocument(data: any): Document {
    const doc = super.create({ ...data, version: 1, approvalStatus: "pending", downloads: 0, viewCount: 0, createdAt: new Date(), updatedAt: new Date() });
    auditLogService.log({ entityType: 'document', entityId: doc.id, action: 'created', performedBy: 'admin-1', performedByName: 'Admin', performedByRole: 'admin', details: `Doc ${doc.title} criado` });
    return doc;
  }

  updateDocument(id: string, data: any) { return this.update(id, data); }
  deleteDocument(id: string) { return this.delete(id); }
  deleteMultipleDocuments(ids: string[]) { ids.forEach(id => this.delete(id)); return ids.length; }
  duplicateDocument(id: string) { const doc = this.getById(id); return doc ? this.createDocument({ ...doc, id: undefined, title: `${doc.title} (Cópia)` }) : null; }
  restoreDocument(id: string) { return !!this.update(id, { status: "published" }); }
  
  toggleFavorite(id: string): boolean {
    const doc = this.getById(id);
    if (!doc) return false;
    return !!this.update(id, { isFavorite: !doc.isFavorite });
  }

  logView(id: string) {
    const doc = this.getById(id);
    if (doc) this.update(id, { viewCount: (doc.viewCount || 0) + 1 });
  }

  downloadDocument(id: string) {
    const doc = this.getById(id);
    if (doc) this.update(id, { downloads: (doc.downloads || 0) + 1 });
  }

  shareDocument(id: string) { return `${window.location.origin}/share/doc/${id}`; }
  
  getCategories() {
    return [
      { id: "contrato", name: "Contratos", icon: "FileText", color: "blue" },
      { id: "manual", name: "Manuais", icon: "Book", color: "green" },
    ];
  }

  getDocumentStats() { return { total: this.items.length, pending: this.items.filter(d => d.approvalStatus === 'pending').length }; }
  getSignatureHistory(id: string) { return this.getById(id)?.signatures || []; }
  signDocument(id: string, data: any) { return this.update(id, { status: "published" }); }
  rejectSignature(id: string, reason: string) { return this.update(id, { approvalStatus: "rejected", approvalComment: reason }); }
  getFolderStructure() { return []; }
  moveDocument(id: string, folderId: string) { return !!this.update(id, { status: "published" }); }
  addSigner(id: string, signer: any) { 
    const doc = this.getById(id);
    if (!doc) return null;
    return this.update(id, { signatures: [...(doc.signatures || []), signer] });
  }
  generateDocument(type: string, data: any) { return this.createDocument({ title: `Novo ${type}`, type: "auto", ...data }); }
}

export const documentService = new DocumentService();
