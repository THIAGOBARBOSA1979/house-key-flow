import { useState, useEffect, useCallback } from "react";
import { 
  FileText, FolderPlus, Clock, CheckCircle2, 
  Plus, FileUp, Download, Archive, Trash2,
  LayoutGrid, List, LayoutDashboard, BarChart, Eye,
  MoreHorizontal, Share2, Edit, ShieldCheck, Move, RotateCw,
  History as HistoryIcon
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks";
import { documentService, Document } from "@/services";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { DataView } from "@/components/shared/DataView";
import { exportService } from "@/services";
import { BulkActions } from "@/components/documents/BulkActions";
import { DocumentFilters } from "@/components/documents/DocumentFilters";
import { DocumentAnalytics } from "@/components/documents/DocumentAnalytics";
import { DocumentsDashboard } from "@/components/documents/DocumentsDashboard";
import { FolderManager } from "@/components/documents/FolderManager";
import { DocumentPreviewDialog } from "@/components/documents/DocumentPreviewDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocumentWorkflow } from "@/components/documents/DocumentWorkflow";
import { UploadDocumentDialog } from "@/components/documents/UploadDocumentDialog";
import { DocumentVersionHistory } from "@/components/documents/DocumentVersionHistory";
import { SignatureWorkflowDialog } from "@/components/documents/SignatureWorkflowDialog";
import { DigitalSignatureDialog } from "@/components/documents/DigitalSignatureDialog";
import { DataViewMode } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";





const AdminDocuments = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [viewMode, setViewMode] = useState<DataViewMode>("table");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<any>({
    category: "",
    status: "",
    priority: "",
    folderId: null
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isSignatureWorkflowOpen, setIsSignatureWorkflowOpen] = useState(false);
  
  useEffect(() => {
    const fetchDocs = async () => {
      const docs = await documentService.searchDocuments(searchTerm, activeFilters);
      setDocuments(docs);
    };
    fetchDocs();
  }, [searchTerm, activeFilters]);

  const refreshDocuments = async () => {
    const docs = await documentService.searchDocuments(searchTerm, activeFilters);
    setDocuments(docs);
  };

  const handleDelete = async (id: string) => {
    await documentService.deleteDocument(id);
    refreshDocuments();
    toast({
      title: "Documento removido",
      description: "O arquivo foi excluído permanentemente.",
      variant: "destructive"
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'published': return <Badge className="badge-status badge-complete"><CheckCircle2 className="w-3 h-3" /> Publicado</Badge>;
      case 'draft': return <Badge className="badge-status badge-pending"><Clock className="w-3 h-3" /> Rascunho</Badge>;
      case 'archived': return <Badge className="badge-status bg-muted text-muted-foreground border-muted-foreground/20"><Archive className="w-3 h-3" /> Arquivado</Badge>;
      case 'trash': return <Badge variant="destructive" className="badge-status bg-red-50 text-red-600 border-red-200"><Trash2 className="w-3 h-3" /> Lixeira</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <PageHeader
        icon={FileText}
        title="Gestão de Documentos"
        description="Repositório centralizado de arquivos técnicos, contratos e licenças."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="hidden sm:flex rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95" onClick={() => exportService.exportToCSV(documents, 'documentos_admin')}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button variant="outline" className="rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95" onClick={() => setIsUploadOpen(true)}>
            <FolderPlus className="mr-2 h-4 w-4" /> Nova Pasta
          </Button>
          <Button onClick={() => setIsUploadOpen(true)} className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
            <FileUp className="mr-2 h-4 w-4" strokeWidth={3} /> Upload de Arquivos
          </Button>
        </div>
      </PageHeader>

      <ResponsiveGrid columns={4} gap="layout">
        <StatsCard 
          label="Total Arquivos" 
          value={documents.length} 
          icon={FileText} 
          variant="brand" 
          description="Contratos e licenças"
          className="rounded-3xl"
        />
        <StatsCard 
          label="Pendentes" 
          value={documents.filter(d => d.status === 'draft').length} 
          icon={Clock} 
          variant="pending" 
          description="Aguardando publicação"
          className="rounded-3xl"
        />
        <StatsCard 
          label="Sincronizados" 
          value={documents.filter(d => d.status === 'published').length} 
          icon={CheckCircle2} 
          variant="complete" 
          description="Nuvem (G-Drive)"
          className="rounded-3xl"
        />
        <Card className="card-standard border-none bg-card/40 backdrop-blur-md overflow-hidden flex flex-col justify-center px-6 py-4 rounded-3xl shadow-sem-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/80">Armazenamento</p>
            <span className="text-[10px] font-black text-primary">18%</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <h3 className="text-xl font-black text-foreground leading-tight">1.8 GB</h3>
            <span className="text-[10px] text-muted-foreground font-bold uppercase">de 10 GB</span>
          </div>
          <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden border border-border/5">
            <div className="h-full bg-primary transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(var(--primary),0.4)]" style={{ width: '18%' }} />
          </div>
        </Card>
      </ResponsiveGrid>


      <BulkActions 
        documents={documents}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onActionComplete={refreshDocuments}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="all" className="font-bold gap-2">
            <List size={14} /> Lista de Arquivos
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="font-bold gap-2">
            <LayoutDashboard size={14} /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics" className="font-bold gap-2">
            <BarChart size={14} /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 pt-4">
          <DocumentFilters 
            onSearch={(query, filters) => {
              setSearchTerm(query);
              setActiveFilters(filters);
            }}
            activeFilters={activeFilters}
            onClearFilters={() => setActiveFilters({
              category: "",
              status: "",
              priority: "",
              folderId: null
            })}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <FolderManager onFolderSelect={(id) => setActiveFilters({...activeFilters, folderId: id})} />
              {selectedDoc && (
                <DocumentWorkflow 
                  document={selectedDoc} 
                  onUpdate={refreshDocuments} 
                />
              )}
            </div>

            <Card className="lg:col-span-3 card-standard border-none bg-background/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                  <div className="text-xs font-bold text-muted-foreground uppercase">
                    {documents.length} Arquivos encontrados
                  </div>
                  <div className="flex bg-muted/40 p-1 rounded-xl">
                    <Button 
                      variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setViewMode('grid')} 
                      className="rounded-lg h-8 w-8 p-0"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={viewMode === 'table' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setViewMode('table')} 
                      className="rounded-lg h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <DataView<Document>
                  items={documents}
                  viewMode={viewMode}
                  itemsPerPage={12}
                  renderGrid={(doc) => (
                    <Card 
                      key={doc.id} 
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('documentId', doc.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className={cn(
                        "card-standard group relative overflow-hidden h-56 flex flex-col justify-between p-4 border-none bg-muted/20 hover:bg-muted/40 cursor-pointer active:scale-[0.98] transition-all",
                        selectedDoc?.id === doc.id && "ring-2 ring-primary bg-primary/5"
                      )}
                      onClick={() => {
                        setSelectedDoc(doc);
                        documentService.logView(doc.id);
                        refreshDocuments();
                      }}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="p-2.5 rounded-xl bg-background shadow-sm text-primary group-hover:scale-110 transition-transform duration-300">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex gap-1">
                            {getStatusBadge(doc.status)}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{doc.title}</h3>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="outline" className="text-[9px] h-4 uppercase font-bold border-muted-foreground/10">{doc.category}</Badge>
                            {doc.tags?.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[9px] bg-primary/10 text-primary px-1 rounded font-bold">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/10 flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Criado em</span>
                          <span className="text-xs font-bold">{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] font-bold h-6">
                            <Eye className="w-3 h-3 mr-1 opacity-50" /> {doc.viewCount || 0}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-background/50 hover:bg-background shadow-sm" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 animate-in zoom-in-95">
                              <DropdownMenuItem className="text-xs font-bold cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDoc(doc);
                                setIsPreviewOpen(true);
                              }}>
                                <Eye className="w-3.5 h-3.5 mr-2" /> Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs font-bold cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                documentService.downloadDocument(doc.id);
                              }}>
                                <Download className="w-3.5 h-3.5 mr-2" /> Baixar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs font-bold text-destructive focus:text-destructive cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(doc.id);
                              }}>
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> {doc.status === 'trash' ? 'Excluir' : 'Lixeira'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  )}
                  columns={[
                    {
                      header: "Arquivo",
                      accessorKey: "title",
                      cell: (doc: Document) => (
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={selectedIds.includes(doc.id)} 
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedIds([...selectedIds, doc.id]);
                              else setSelectedIds(selectedIds.filter(id => id !== doc.id));
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="p-2 rounded bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate max-w-[150px] sm:max-w-xs">{doc.title}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                              {doc.fileName || 'Documento Automático'} {doc.fileSize && `• ${doc.fileSize}`}
                            </p>
                          </div>
                        </div>
                      )
                    },
                    {
                      header: "Categoria / Tags",
                      accessorKey: "category",
                      cell: (doc: Document) => (
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold border-muted-foreground/20 w-fit">{doc.category}</Badge>
                          <div className="flex flex-wrap gap-1">
                            {doc.tags?.map(tag => (
                              <span key={tag} className="text-[9px] bg-primary/10 text-primary px-1 rounded font-bold">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      )
                    },
                    {
                      header: "Visualizações",
                      accessorKey: "viewCount",
                      className: "text-center",
                      cell: (doc: Document) => (
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          <Eye className="w-3 h-3 mr-1 opacity-50" /> {doc.viewCount || 0}
                        </Badge>
                      )
                    },
                    {
                      header: "Criado em",
                      accessorKey: "createdAt",
                      cell: (doc: Document) => new Date(doc.createdAt).toLocaleDateString('pt-BR')
                    },
                    {
                      header: "Status",
                      accessorKey: "status",
                      cell: (doc: Document) => getStatusBadge(doc.status)
                    },
                    {
                      header: "Ações",
                      accessorKey: "id",
                      className: "text-right",
                      cell: (doc: Document) => (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted group">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 animate-in zoom-in-95">
                            <DropdownMenuItem className="text-xs font-bold cursor-pointer" onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoc(doc);
                              setIsPreviewOpen(true);
                            }}>
                              <Eye className="w-3.5 h-3.5 mr-2" /> Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs font-bold cursor-pointer" onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoc(doc);
                              setIsHistoryOpen(true);
                            }}>
                              <HistoryIcon className="w-3.5 h-3.5 mr-2" /> Histórico de Versões
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs font-bold cursor-pointer" onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoc(doc);
                              const link = documentService.shareDocument(doc.id);
                              navigator.clipboard.writeText(link);
                              toast({ 
                                title: "Link Copiado", 
                                description: "Link de compartilhamento seguro copiado para a área de transferência." 
                              });
                            }}>
                              <Share2 className="w-3.5 h-3.5 mr-2" /> Compartilhar Link
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs font-bold cursor-pointer" onClick={(e) => {
                              e.stopPropagation();
                              documentService.downloadDocument(doc.id);
                              toast({
                                title: "Download Iniciado",
                                description: `Baixando arquivo: ${doc.title}`
                              });
                            }}>
                              <Download className="w-3.5 h-3.5 mr-2" /> Baixar arquivo
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs font-bold cursor-pointer" onClick={(e) => e.stopPropagation()}>
                              <Edit className="w-3.5 h-3.5 mr-2" /> Editar documento
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs font-bold cursor-pointer" onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoc(doc);
                              setIsSignatureWorkflowOpen(true);
                            }}>
                              <ShieldCheck className="w-3.5 h-3.5 mr-2" /> Configurar Assinaturas
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs font-bold cursor-pointer" onClick={(e) => {
                              e.stopPropagation();
                              // Implementar lógica de mover (abriria um sub-modal ou similar)
                              toast({ title: "Mover Documento", description: "Funcionalidade de movimentação entre pastas ativada." });
                            }}>
                              <Move className="w-3.5 h-3.5 mr-2" /> Mover para pasta
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {doc.status === 'trash' ? (
                              <DropdownMenuItem 
                                className="text-xs font-bold text-green-600 focus:text-green-600 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  documentService.restoreDocument(doc.id);
                                  refreshDocuments();
                                  toast({ title: "Documento Restaurado", description: "O arquivo voltou para a listagem principal." });
                                }}
                              >
                                <RotateCw className="w-3.5 h-3.5 mr-2" /> Restaurar documento
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem 
                              className="text-xs font-bold text-destructive focus:text-destructive cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(doc.id);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> {doc.status === 'trash' ? 'Excluir permanentemente' : 'Enviar para Lixeira'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )
                    }
                  ]}
                  onRowClick={(doc) => {
                    setSelectedDoc(doc);
                    documentService.logView(doc.id);
                    refreshDocuments();
                  }}
                  emptyState={{
                    title: "Nenhum documento encontrado",
                    description: "Não encontramos arquivos com os filtros atuais."
                  }}
                />

              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="pt-4">
          <DocumentsDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="pt-4">
          <DocumentAnalytics />
        </TabsContent>
      </Tabs>

      <DocumentPreviewDialog 
        document={selectedDoc}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

      <UploadDocumentDialog 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={refreshDocuments}
      />

      {selectedDoc && (
        <DocumentVersionHistory 
          document={selectedDoc} 
          isOpen={isHistoryOpen} 
          onOpenChange={setIsHistoryOpen}
        />
      )}

      {selectedDoc && (
        <SignatureWorkflowDialog
          documentId={selectedDoc.id}
          isOpen={isSignatureWorkflowOpen}
          onClose={() => setIsSignatureWorkflowOpen(false)}
          onSuccess={refreshDocuments}
        />
      )}

      {selectedDoc && (
        <DigitalSignatureDialog
          isOpen={false} // Somente para garantir que o componente está disponível no escopo se necessário
          onClose={() => {}}
          documentId={selectedDoc.id}
          documentTitle={selectedDoc.title}
        />
      )}
    </div>
  );
};

export default AdminDocuments;
