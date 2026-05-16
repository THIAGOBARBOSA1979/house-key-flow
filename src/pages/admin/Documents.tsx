import { useState, useEffect } from "react";
import { 
  FileText, Search, Upload, Filter, Download, Trash2, 
  MoreHorizontal, FileUp, FolderPlus, Clock, CheckCircle2, 
  AlertCircle, Plus, LayoutGrid, List, Edit, Eye, Star, 
  Archive, Copy, BarChart, LayoutDashboard, Folder,
  ShieldCheck, Share2, History as HistoryIcon, Tag, RotateCw, Move
} from "lucide-react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { documentService, Document } from "@/services/DocumentService";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";

import { exportService } from "@/services/ExportService";
import { BulkActions } from "@/components/Documents/BulkActions";
import { DocumentFilters } from "@/components/Documents/DocumentFilters";
import { DocumentAnalytics } from "@/components/Documents/DocumentAnalytics";
import { DocumentsDashboard } from "@/components/Documents/DocumentsDashboard";
import { FolderManager } from "@/components/Documents/FolderManager";
import { DocumentPreviewDialog } from "@/components/Documents/DocumentPreviewDialog";
import { DocumentWorkflow } from "@/components/Documents/DocumentWorkflow";
import { UploadDocumentDialog } from "@/components/Documents/UploadDocumentDialog";
import { DocumentVersionHistory } from "@/components/Documents/DocumentVersionHistory";
import { SignatureWorkflowDialog } from "@/components/Documents/SignatureWorkflowDialog";
import { DigitalSignatureDialog } from "@/components/Documents/DigitalSignatureDialog";

const AdminDocuments = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
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
  
  const categories = documentService.getCategories();

  useEffect(() => {
    refreshDocuments();
  }, [searchTerm, activeFilters]);

  const refreshDocuments = () => {
    const docs = documentService.searchDocuments(searchTerm, activeFilters);
    setDocuments(docs);
  };

  const handleDelete = (id: string) => {
    documentService.deleteDocument(id);
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
                  <Button variant="outline" size="icon" onClick={() => setViewMode(v => v === "list" ? "grid" : "list")} className="h-8 w-8">
                    {viewMode === "list" ? <LayoutGrid size={16} /> : <List size={16} />}
                  </Button>
                </div>

                {viewMode === "list" ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30 border-b-border/10">
                          <TableHead className="text-tiny text-muted-foreground font-bold py-4">Arquivo</TableHead>
                          <TableHead className="text-tiny text-muted-foreground font-bold py-4">Categoria / Tags</TableHead>
                          <TableHead className="text-tiny text-muted-foreground font-bold py-4 text-center">Visualizações</TableHead>
                          <TableHead className="text-tiny text-muted-foreground font-bold py-4">Criado em</TableHead>
                          <TableHead className="text-tiny text-muted-foreground font-bold py-4">Status</TableHead>
                          <TableHead className="text-tiny text-muted-foreground font-bold py-4 text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.length > 0 ? (
                          documents.map((doc) => (
                            <TableRow 
                              key={doc.id} 
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('documentId', doc.id);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              className={cn(
                                "group hover:bg-muted/20 transition-colors border-b-border/5 cursor-pointer",
                                selectedDoc?.id === doc.id && "bg-primary/5"
                              )}
                              onClick={() => {
                                setSelectedDoc(doc);
                                documentService.logView(doc.id);
                                refreshDocuments();
                              }}
                            >
                              <TableCell className="py-4">
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
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge variant="outline" className="text-[10px] uppercase font-bold border-muted-foreground/20 w-fit">{doc.category}</Badge>
                                  <div className="flex flex-wrap gap-1">
                                    {doc.tags?.map(tag => (
                                      <span key={tag} className="text-[9px] bg-primary/10 text-primary px-1 rounded font-bold">#{tag}</span>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary" className="text-[10px] font-bold">
                                  <Eye className="w-3 h-3 mr-1 opacity-50" /> {doc.viewCount || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground font-medium">
                                {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(doc.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
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
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="py-20 text-center">
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <FileText size={48} className="opacity-20" />
                                <p className="text-sm font-medium italic">Nenhum documento encontrado.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                    {documents.map(doc => (
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
                    ))}
                  </div>
                )}
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
    </div>
  );
};

export default AdminDocuments;
