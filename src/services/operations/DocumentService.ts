import { SupabaseBaseService } from "../SupabaseBaseService";

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
  evidence?: any;
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
  version: number;
  approvalStatus: "pending" | "approved" | "rejected";
  createdBy?: string;
  priority?: "low" | "medium" | "high";
  expiresAt?: Date;
  isSigned?: boolean;
  isFavorite?: boolean;
}

class DocumentService extends SupabaseBaseService<Document> {
  constructor() {
    super({
      storageKey: "a2_documents",
      supabaseTable: "documents",
      auditEntityType: "document",
      shouldSyncWithSupabase: true
    });
  }

  async getAllDocuments() { return await this.getAll(); }
  async getDocumentById(id: string) { return await this.getById(id); }
  
  getDocumentsByClient(clientName: string) { 
    return this.items.filter(doc => doc?.associatedTo?.client === clientName); 
  }
  
  getFavoriteDocuments() { return this.items.filter(doc => doc.isFavorite); }
  
  async getSignatureHistory(id: string) { 
    const doc = await this.getById(id);
    return doc?.signatures || []; 
  }
  
  async createDocument(data: any) { return await this.create(data); }
  async updateDocument(id: string, data: any) { return await this.update(id, data); }
  async deleteDocument(id: string) { return await this.delete(id); }
  async deleteMultipleDocuments(ids: string[]) { return await this.bulkDelete(ids); }
  
  async restoreDocument(id: string) {
    return await this.update(id, { status: 'published' });
  }

  async logView(id: string) {
    const doc = this.getByIdSync(id);
    if (doc) await this.update(id, { viewCount: (doc.viewCount || 0) + 1 });
  }

  async downloadDocument(id: string) {
    const doc = await this.getById(id);
    if (!doc) throw new Error("Documento não encontrado");
    await this.update(id, { downloads: (doc.downloads || 0) + 1 });
    return doc.fileUrl;
  }

  shareDocument(id: string) {
    return `${window.location.origin}/share/doc/${id}`;
  }

  async searchDocuments(term: string, filters: { category?: string; companyId?: string; isSuperAdmin?: boolean }): Promise<Document[]> {
    const allDocs = await this.getAll(filters.companyId, filters.isSuperAdmin);
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

  async getDocumentStats(companyId?: string, isSuperAdmin?: boolean) { 
    const items = await this.getAll(companyId, isSuperAdmin);
    return { 
      total: items.length, 
      pending: items.filter(d => d.approvalStatus === 'pending').length,
      published: items.filter(d => d.status === 'published').length,
      draft: items.filter(d => d.status === 'draft').length,
      archived: items.filter(d => d.status === 'archived').length,
      favorites: items.filter(d => d.isFavorite).length,
      expiring: 0,
      byCategory: items.reduce((acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
  
  async signDocument(id: string, signerId: string) { 
    const doc = await this.getById(id);
    if (!doc) return false;
    const signatures = doc.signatures?.map(s => s.id === signerId ? { ...s, status: "signed" as const, signedAt: new Date() } : s);
    return !!(await this.update(id, { signatures, isSigned: true }));
  }

  async rejectSignature(id: string, signerId: string, reason: string) { 
    const doc = await this.getById(id);
    if (!doc) return false;
    const signatures = doc.signatures?.map(s => s.id === signerId ? { ...s, status: "rejected" as const, rejectionReason: reason } : s);
    return !!(await this.update(id, { signatures }));
  }

  async addSigner(id: string, signer: Omit<DocumentSignature, "id" | "status">): Promise<DocumentSignature | null> { 
    const doc = await this.getById(id);
    if (!doc) return null;
    const newSigner: DocumentSignature = { ...signer, id: crypto.randomUUID(), status: "pending" };
    await this.update(id, { signatures: [...(doc.signatures || []), newSigner] });
    return newSigner;
  }
}

export const documentService = new DocumentService();
