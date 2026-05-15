import { useState, useEffect } from "react";
import { 
  FileText, Search, Upload, Filter, Download, Trash2, 
  MoreHorizontal, FileUp, FolderPlus, Clock, CheckCircle2, 
  AlertCircle, Plus, LayoutGrid, List, Edit, Eye, Star, 
  Archive, Copy, BarChart, LayoutDashboard, Folder
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
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container-responsive py-8 space-y-8 animate-fade-in">
      <PageHeader
        icon={FileText}
        title="Gestão de Documentos"
        description="Centralize todos os arquivos técnicos, contratos e alvarás"
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="interactive-active h-9 font-bold" onClick={() => exportService.exportToCSV(documents, 'documentos_admin')}>
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
          <Button variant="outline" size="sm" className="interactive-active h-9 font-bold">
            <FolderPlus className="w-4 h-4 mr-2" /> Nova Pasta
          </Button>
          <Button size="sm" className="interactive-active h-9 font-bold bg-primary hover:bg-primary/90">
            <FileUp className="w-4 h-4 mr-2" /> Upload de Arquivos
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          label="Total Arquivos" 
          value={documents.length} 
          icon={FileText} 
          variant="brand" 
          description="Contratos e licenças"
        />
        <StatsCard 
          label="Rascunhos" 
          value={documents.filter(d => d.status === 'draft').length} 
          icon={Clock} 
          variant="pending" 
          description="Aguardando publicação"
        />
        <StatsCard 
          label="Sincronizados" 
          value={documents.filter(d => d.status === 'published').length} 
          icon={CheckCircle2} 
          variant="complete" 
          description="Em nuvem (G-Drive)"
        />
        <Card className="card-standard border-none bg-background/50 backdrop-blur-sm overflow-hidden flex flex-col justify-center px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sem-tiny uppercase font-bold tracking-widest text-muted-foreground/80">Armazenamento</p>
            <span className="text-sem-tiny font-black text-primary">18%</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <h3 className="text-sem-h3 font-bold text-foreground leading-tight">1.8 GB</h3>
            <span className="text-sem-caption text-muted-foreground">de 10 GB</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden border border-border/10">
            <div className="h-full bg-primary transition-all duration-1000 ease-out rounded-full" style={{ width: '18%' }} />
          </div>
        </Card>
      </div>

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
                          <TableHead className="text-tiny text-muted-foreground font-bold py-4">Categoria</TableHead>
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
                              className={cn(
                                "group hover:bg-muted/20 transition-colors border-b-border/5 cursor-pointer",
                                selectedDoc?.id === doc.id && "bg-primary/5"
                              )}
                              onClick={() => setSelectedDoc(doc)}
                            >
                              <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                  <Checkbox 
                                    checked={selectedIds.includes(doc.id)} 
                                    onCheckedChange={(checked) => {
                                      if (checked) setSelectedIds([...selectedIds, doc.id]);
                                      else setSelectedIds(selectedIds.filter(id => id !== doc.id));
                                    }}
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
                                <Badge variant="outline" className="text-[10px] uppercase font-bold border-muted-foreground/20">{doc.category}</Badge>
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
                                    <DropdownMenuItem className="text-xs font-bold cursor-pointer" onClick={() => setIsPreviewOpen(true)}>
                                      <Eye className="w-3.5 h-3.5 mr-2" /> Visualizar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs font-bold cursor-pointer">
                                      <Download className="w-3.5 h-3.5 mr-2" /> Baixar arquivo
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs font-bold cursor-pointer">
                                      <Edit className="w-3.5 h-3.5 mr-2" /> Editar documento
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-xs font-bold text-destructive focus:text-destructive cursor-pointer"
                                      onClick={() => handleDelete(doc.id)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir permanentemente
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
                      <Card key={doc.id} className={cn(
                        "card-standard group relative overflow-hidden h-44 flex flex-col justify-between p-4 border-none bg-muted/20 hover:bg-muted/40 cursor-pointer active:scale-[0.98] transition-all",
                        (selectedIds.includes(doc.id) || selectedDoc?.id === doc.id) && "ring-2 ring-primary bg-primary/5"
                      )} onClick={() => setSelectedDoc(doc)}>
                         <div className="flex justify-between items-start">
                            <div className="p-3 bg-card rounded-xl shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-all border border-border/10">
                              <FileText size={22} />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {getStatusBadge(doc.status)}
                            </div>
                         </div>
                         <div className="mt-4">
                            <h4 className="text-label font-bold truncate pr-6 group-hover:text-primary transition-colors">{doc.title}</h4>
                            <p className="text-sem-tiny text-muted-foreground font-bold uppercase tracking-tighter mt-1">
                              {doc.category} • {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                         </div>
                         <div className="absolute top-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background shadow-md border border-border/10">
                                  <MoreHorizontal size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 animate-in zoom-in-95">
                                <DropdownMenuItem className="text-xs font-bold py-2 cursor-pointer" onClick={() => setIsPreviewOpen(true)}><Eye size={14} className="mr-2" /> Ver</DropdownMenuItem>
                                <DropdownMenuItem className="text-xs font-bold py-2 cursor-pointer"><Download size={14} className="mr-2" /> Baixar</DropdownMenuItem>
                                <DropdownMenuItem className="text-xs font-bold py-2 text-destructive focus:text-destructive cursor-pointer" onClick={() => handleDelete(doc.id)}><Trash2 size={14} className="mr-2" /> Excluir</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
    </div>
  );
};

export default AdminDocuments;
