import { BaseService } from "../BaseService";
import { SupabaseBaseService } from "../SupabaseBaseService";
import { Supabase } from "@/integrations/supabase";
import { Database } from "@/integrations/supabase/types";

export interface SignatureEvidence {
  browser?: string;
  os?: string;
  location?: string;
  [key: string]: unknown;
}

export interface DocumentSignature {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "pending" | "signed" | "rejected";
  signedAt?: Date;
  confirmationMethod: "email" | "sms" | "govbr" | "facial";
  order?: number;
  ipAddress?: string;
  documentHash?: string;
  evidence?: SignatureEvidence;
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
  company_id?: string;
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
  priority?: "low" | "medium" | "high";
  expiresAt?: Date;
  isSigned?: boolean;
  isFavorite?: boolean;
  technical_metadata?: {
    dimensions?: string;
    resolution?: string;
    scale?: string;
    layers?: boolean;
    [key: string]: any;
  };
}

const INITIAL_DOCUMENTS: Document[] = [
  {
    id: "1",
    company_id: "comp-1",
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
    version: 1,
    approvalStatus: "approved",
    template: "Contrato de exemplo",
    signatures: [],
    createdBy: "Admin",
    priority: "high",
    isSigned: false,
    isFavorite: true
  },
];

class DocumentService extends SupabaseBaseService<Document> {
  constructor() {
    super({
      storageKey: "a2_documents",
      supabaseTable: "documents",
      auditEntityType: "document",
      shouldSyncWithSupabase: true
    });
  }


  // Backward compatibility aliases
  getAllDocuments() { return this.getAll(undefined, true); }
  getDocumentById(id: string) { return this.getById(id, undefined, true); }
  getDocumentsByClient(clientName: string) { return this.items.filter(doc => doc?.associatedTo?.client === clientName || (doc as any).client_name === clientName); }
  getFavoriteDocuments() { return this.items.filter(doc => doc.isFavorite); }
  getExpiringDocuments() { return this.items.filter(d => d.expiresAt); }
  getCategories() {
    return [
      { id: "contrato", name: "Contratos", icon: "FileText", color: "blue" },
      { id: "manual", name: "Manuais", icon: "Book", color: "green" },
    ];
  }
  getSignatureHistory(id: string) { return this.getById(id, undefined, true)?.signatures || []; }
  createDocument(data: any) { return this.create(data); }
  updateDocument(id: string, data: any) { return this.update(id, data, true); }
  deleteDocument(id: string) { return this.delete(id); }
  deleteMultipleDocuments(ids: string[]) { return this.bulkDelete(ids); }
  shareDocument(id: string) { return `${window.location.origin}/share/doc/${id}`; }
  restoreDocument(id: string) { return !!this.update(id, { status: "published" }, true); }
  getFolderStructure() { return []; }
  moveDocument(id: string, folderId: string) { return !!this.update(id, { status: "published" }, true); }
  generateDocument(type: string, data: any) { return this.create({ title: `Novo ${type}`, type: "auto", ...data } as any); }

  searchDocuments(term: string, filters: { category?: string; companyId?: string; isSuperAdmin?: boolean }): Document[] {
    const allDocs = this.getAll(filters.companyId, filters.isSuperAdmin);
    return allDocs.filter(doc => {
      const matchesSearch = !term || doc.title.toLowerCase().includes(term.toLowerCase());
      const matchesCategory = !filters.category || filters.category === 'all' || doc.category === filters.category;
      return matchesSearch && matchesCategory;
    });
  }

  async create(item: Omit<Document, "id">, companyId?: string): Promise<Document> {
    return await super.create({
      ...item,
      version: 1,
      approvalStatus: "pending",
      downloads: 0,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: item.status || "draft"
    }, companyId);
  }


  duplicateDocument(id: string) {
    const doc = this.getById(id, undefined, true);
    if (!doc) return null;
    const { id: _, ...rest } = doc;
    return this.create({
      ...rest,
      title: `${doc.title} (Cópia)`,
      status: "draft"
    }, doc.company_id);
  }

  toggleFavorite(id: string): boolean {
    const doc = this.getById(id, undefined, true);
    if (!doc) return false;
    return !!this.update(id, { isFavorite: !doc.isFavorite }, true);
  }

  logView(id: string) {
    const doc = this.getById(id, undefined, true);
    if (doc) this.update(id, { viewCount: (doc.viewCount || 0) + 1 }, true);
  }

  async downloadDocument(id: string) {
    const doc = this.getById(id, undefined, true);
    if (!doc) throw new Error("Documento não encontrado para download");
    
    try {
      await this.update(id, { downloads: (doc.downloads || 0) + 1 }, true);
      return doc.fileUrl;
    } catch (err) {
      throw new Error(`Falha no protocolo de download: ${err instanceof Error ? err.message : 'Erro de rede'}`);
    }
  }

  getDocumentStats(companyId?: string, isSuperAdmin?: boolean) { 
    const items = this.getAll(companyId, isSuperAdmin);
    const stats = { 
      total: items.length, 
      pending: items.filter(d => d.approvalStatus === 'pending').length,
      published: items.filter(d => d.status === 'published').length,
      draft: items.filter(d => d.status === 'draft').length,
      archived: items.filter(d => d.status === 'archived').length,
      favorites: items.filter(d => d.isFavorite).length,
      expiring: 0,
      byCategory: {} as Record<string, number>
    };
    items.forEach(d => {
      stats.byCategory[d.category] = (stats.byCategory[d.category] || 0) + 1;
    });
    return stats;
  }
  
  signDocument(id: string, signerId: string, method?: string, evidence?: any) { 
    const doc = this.getById(id, undefined, true);
    if (!doc) return false;
    const signatures = doc.signatures?.map(s => s.id === signerId ? { ...s, status: "signed" as const, signedAt: new Date() } : s);
    return !!this.update(id, { signatures, isSigned: true }, true);
  }

  rejectSignature(id: string, signerId: string, reason: string) { 
    const doc = this.getById(id, undefined, true);
    if (!doc) return false;
    const signatures = doc.signatures?.map(s => s.id === signerId ? { ...s, status: "rejected" as const, rejectionReason: (reason as any) } : s);
    return !!this.update(id, { signatures }, true);
  }

  addSigner(id: string, signer: Omit<DocumentSignature, "id" | "status">): DocumentSignature | null { 
    const doc = this.getById(id, undefined, true);
    if (!doc) return null;
    const newSigner: DocumentSignature = { ...signer, id: crypto.randomUUID(), status: "pending" };
    this.update(id, { signatures: [...(doc.signatures || []), newSigner] }, true);
    return newSigner;
  }
}

export const documentService = new DocumentService();
