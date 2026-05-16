
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
      template: `CONTRATO DE COMPRA E VENDA - RESIDENCIAL AURORA

VENDEDOR: A2 Incorporadora e Engenharia LTDA
COMPRADOR: {{nome_cliente}}
CPF/CNPJ: {{documento_cliente}}
IMÓVEL: {{endereco}}
UNIDADE: {{unidade}}
VALOR TOTAL: {{valor}}
FORMA DE PAGAMENTO: {{forma_pagamento}}

1. OBJETO DO CONTRATO
O presente contrato tem por objeto a promessa de compra e venda da unidade imobiliária acima descrita.

2. PRAZO DE ENTREGA
A VENDEDORA se compromete a entregar o imóvel pronto para morar até a data de {{data_entrega}}.

3. DAS ASSINATURAS
Este documento utiliza tecnologia de assinatura eletrônica com plena validade jurídica.`,
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
      approvedAt: new Date(2025, 4, 10),
      signatures: [
        {
          id: "sig-1",
          name: "João Silva",
          email: "joao.silva@exemplo.com",
          role: "Comprador",
          status: "pending",
          confirmationMethod: "email",
          order: 1
        },
        {
          id: "sig-2",
          name: "Ricardo Mendes",
          email: "ricardo@a2empreendimentos.com",
          role: "Representante A2",
          status: "signed",
          signedAt: new Date(2025, 4, 11, 14, 30),
          ipAddress: "177.45.12.98",
          confirmationMethod: "email",
          order: 2,
          documentHash: "SHA256-A8B9C10D11E12F13G14H15",
          evidence: {
            browser: "Chrome 124.0.0.0",
            os: "macOS",
            location: "São Paulo, SP"
          }
        }
      ]
    },
    {
      id: "2", 
      title: "Manual do Proprietário",
      type: "manual",
      category: "manual",
      folderId: "f1",
      viewCount: 120,
      fileUrl: "/docs/manual-proprietario.pdf",
      fileName: "manual-proprietario.pdf",
      fileSize: "850 KB",
      associatedTo: { property: "Edifício Aurora" },
      visible: true,
      createdAt: new Date(2025, 4, 12),
      updatedAt: new Date(2025, 4, 12),
      downloads: 12,
      status: "published",
      approvalStatus: "approved",
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
      folderId: "f2",
      viewCount: 12,
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
      approvalStatus: "pending",
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

  private templateVariables: TemplateVariable[] = [
    { key: "nome_cliente", label: "Nome do Cliente", description: "Nome completo do cliente", type: "text", required: true },
    { key: "documento_cliente", label: "CPF/CNPJ", description: "Documento de identificação", type: "text", required: true },
    { key: "endereco", label: "Endereço", description: "Endereço completo do imóvel", type: "text", required: true },
    { key: "unidade", label: "Unidade", description: "Número da unidade/apartamento", type: "text", required: true },
    { key: "valor", label: "Valor", description: "Valor do imóvel", type: "text", required: true },
    { key: "forma_pagamento", label: "Forma de Pagamento", description: "Descrição das parcelas e entrada", type: "text", required: true },
    { key: "data_entrega", label: "Data de Entrega", description: "Data prevista para entrega das chaves", type: "date", required: true },
    { key: "data", label: "Data Atual", description: "Data de geração do documento", type: "date", required: true },
    { key: "empreendimento", label: "Empreendimento", description: "Nome do empreendimento", type: "text", required: false }
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

  createDocument(data: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'downloads' | 'version' | 'approvalStatus' | 'viewCount' | 'isSigned'>): Document {
    const newDocument: Document = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      downloads: 0,
      version: 1,
      approvalStatus: 'pending',
      viewCount: 0,
      isSigned: false
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

    const doc = this.documents[index];
    
    // Soft delete logic
    if (doc.status !== 'trash') {
      this.updateDocument(id, { 
        status: 'trash', 
        deletedAt: new Date() 
      });
      
      auditLogService.log({
        entityType: 'document',
        entityId: id,
        action: 'archived',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: `Documento "${doc.title}" enviado para a lixeira.`
      });
      return true;
    }

    // Permanent delete if already in trash
    console.log('DocumentService: Documento excluído permanentemente:', doc.title);
    
    auditLogService.log({
      entityType: 'document',
      entityId: id,
      action: 'archived',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Documento "${doc.title}" foi excluído permanentemente.`
    });

    this.documents.splice(index, 1);
    return true;
  }

  restoreDocument(id: string): boolean {
    const doc = this.getDocumentById(id);
    if (!doc || doc.status !== 'trash') return false;

    this.updateDocument(id, { 
      status: 'published',
      deletedAt: undefined 
    });

    auditLogService.log({
      entityType: 'document',
      entityId: id,
      action: 'updated',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Documento "${doc.title}" restaurado da lixeira.`
    });

    return true;
  }

  moveDocument(id: string, folderId: string | undefined): boolean {
    const doc = this.getDocumentById(id);
    if (!doc) return false;

    this.updateDocument(id, { folderId });

    auditLogService.log({
      entityType: 'document',
      entityId: id,
      action: 'updated',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Documento "${doc.title}" movido para pasta ${folderId || 'Raiz'}.`
    });

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

    auditLogService.log({
      entityType: 'document',
      entityId: id,
      action: 'updated',
      performedBy: userId,
      performedByName: 'Usuário',
      performedByRole: 'admin',
      details: `Documento "${doc.title}" visualizado.`
    });
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

  shareDocument(id: string, email?: string): string {
    const document = this.getDocumentById(id);
    if (!document) throw new Error('Documento não encontrado');
    
    const shareLink = `https://a2-eng.lovable.app/share/doc/${id}-${uuidv4().substring(0, 8)}`;
    
    auditLogService.log({
      entityType: 'document',
      entityId: id,
      action: 'updated',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Link de compartilhamento gerado para o documento "${document.title}"${email ? ` e enviado para ${email}` : ''}.`
    });
    
    return shareLink;
  }

  getFolderStructure() {
    // Simulação de estrutura de pastas para organização profunda
    return [
      { id: "root", name: "Raiz", icon: "Folder" },
      { id: "f1", name: "Contratos", parentId: "root", icon: "FileText" },
      { id: "f2", name: "Vistorias", parentId: "root", icon: "ClipboardCheck" },
      { id: "f3", name: "Projetos", parentId: "root", icon: "Layout" },
      { id: "f3-1", name: "Estrutural", parentId: "f3", icon: "Grid" },
      { id: "f3-2", name: "Elétrico", parentId: "f3", icon: "Zap" },
      { id: "f4", name: "Legal", parentId: "root", icon: "Shield" },
    ];
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

    auditLogService.log({
      entityType: 'document',
      entityId: documentId,
      action: 'downloaded',
      performedBy: 'user-current',
      performedByName: 'Usuário Atual',
      performedByRole: 'admin',
      details: `Download realizado do documento: ${document.title}`
    });

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
    folderId?: string;
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

    if (filters?.folderId) {
      filtered = filtered.filter(doc => doc.folderId === filters.folderId);
    }

    return filtered;
  }

  addSigner(documentId: string, signer: Omit<DocumentSignature, 'id' | 'status'>): DocumentSignature | null {
    const doc = this.getDocumentById(documentId);
    if (!doc) return null;

    const newSignature: DocumentSignature = {
      ...signer,
      id: uuidv4(),
      status: 'pending'
    };

    if (!doc.signatures) doc.signatures = [];
    doc.signatures.push(newSignature);
    
    this.updateDocument(documentId, { signatures: doc.signatures });
    
    auditLogService.log({
      entityType: 'document',
      entityId: documentId,
      action: 'updated',
      performedBy: 'admin-1',
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Signatário ${signer.name} adicionado ao documento "${doc.title}".`
    });

    return newSignature;
  }

  signDocument(documentId: string, signerId: string, ipAddress: string, evidence?: DocumentSignature['evidence']): boolean {
    const doc = this.getDocumentById(documentId);
    if (!doc || !doc.signatures) return false;

    // Verificar se é a vez deste signatário no fluxo sequencial
    const signatureIndex = doc.signatures.findIndex(s => s.id === signerId);
    if (signatureIndex === -1) return false;
    
    const signature = doc.signatures[signatureIndex];
    if (signature.status !== 'pending') return false;

    // Lógica para fluxo sequencial
    if (signature.order && signature.order > 1) {
      const previousSignatures = doc.signatures.filter(s => s.order && s.order < signature.order!);
      const allPreviousSigned = previousSignatures.every(s => s.status === 'signed');
      
      if (!allPreviousSigned) {
        console.warn('DocumentService: Signatário tentou assinar fora de ordem.');
        return false;
      }
    }

    signature.status = 'signed';
    signature.signedAt = new Date();
    signature.ipAddress = ipAddress;
    signature.evidence = evidence;
    
    // Hash criptográfico simulado
    signature.documentHash = `SHA256-${Math.random().toString(36).substring(2, 15).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;

    this.updateDocument(documentId, { signatures: [...doc.signatures] });

    // Se todas as assinaturas foram concluídas, marcar documento como aprovado
    const allSigned = doc.signatures.every(s => s.status === 'signed');
    if (allSigned) {
      this.updateDocument(documentId, { 
        approvalStatus: 'approved', 
        status: 'published',
        isSigned: true,
        signedUrl: `/signed/${doc.id}.pdf`
      });
    }

    auditLogService.log({
      entityType: 'document',
      entityId: documentId,
      action: 'updated',
      performedBy: signature.email,
      performedByName: signature.name,
      performedByRole: 'client',
      details: `Documento "${doc.title}" assinado digitalmente por ${signature.name}. Hash: ${signature.documentHash}`
    });

    return true;
  }

  rejectSignature(documentId: string, signerId: string, reason: string): boolean {
    const doc = this.getDocumentById(documentId);
    if (!doc || !doc.signatures) return false;

    const signature = doc.signatures.find(s => s.id === signerId);
    if (!signature || signature.status !== 'pending') return false;

    signature.status = 'rejected';
    
    this.updateDocument(documentId, { 
      signatures: doc.signatures,
      approvalStatus: 'rejected',
      approvalComment: `Assinatura recusada por ${signature.name}: ${reason}`
    });

    return true;
  }

  getSignatureHistory(documentId: string): DocumentSignature[] {
    const doc = this.getDocumentById(documentId);
    return doc?.signatures || [];
  }
}

export const documentService = new DocumentService();
