import { BaseService } from "./BaseService";
import { auditLogService } from "./AuditLogService";

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

  searchDocuments(term: string, filters: any): Document[] {
    return this.items.filter(doc => {
      const matchesSearch = !term || doc.title.toLowerCase().includes(term.toLowerCase());
      const matchesCategory = !filters.category || filters.category === 'all' || doc.category === filters.category;
      return matchesSearch && matchesCategory;
    });
  }

  getDocumentsByClient(clientName: string): Document[] {
    return this.items.filter(doc => doc.associatedTo.client === clientName);
  }

  getCategories() {
    return [
      { id: "contrato", name: "Contratos", icon: "FileText", color: "blue" },
      { id: "manual", name: "Manuais", icon: "Book", color: "green" },
    ];
  }

  toggleFavorite(id: string): boolean {
    const doc = this.getById(id);
    if (!doc) return false;
    return !!this.update(id, { isFavorite: !doc.isFavorite });
  }

  logView(id: string) {
    const doc = this.getById(id);
    if (doc) this.update(id, { viewCount: (doc.viewCount || 0) + 1 });
  }
}

export const documentService = new DocumentService();
