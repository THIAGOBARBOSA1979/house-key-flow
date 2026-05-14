
import { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  Upload, 
  Filter, 
  Download, 
  Trash2, 
  MoreHorizontal, 
  FileUp, 
  FolderPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  LayoutGrid,
  List,
  Edit,
  Eye,
  Star,
  Archive,
  Copy
} from "lucide-react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { documentService, Document } from "@/services/DocumentService";

const AdminDocuments = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    setDocuments(documentService.getAllDocuments());
  }, []);

  const filteredDocs = documents.filter(doc => 
    (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeTab === "all" || doc.status === activeTab)
  );

  const handleDelete = (id: string) => {
    documentService.deleteDocument(id);
    setDocuments(documentService.getAllDocuments());
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
          <Button variant="outline" size="sm" className="interactive-active h-9 font-bold">
            <FolderPlus className="w-4 h-4 mr-2" /> Nova Pasta
          </Button>
          <Button size="sm" className="interactive-active h-9 font-bold bg-primary hover:bg-primary/90">
            <FileUp className="w-4 h-4 mr-2" /> Upload de Arquivos
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-standard border-none bg-background/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-tiny text-muted-foreground">Total de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-[10px] text-emerald-500 font-bold mt-1">Sincronizado</p>
          </CardContent>
        </Card>
        <Card className="card-standard border-none bg-background/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-tiny text-muted-foreground">Rascunhos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {documents.filter(d => d.status === 'draft').length}
            </div>
            <p className="text-[10px] text-muted-foreground font-bold mt-1">Requer atenção</p>
          </CardContent>
        </Card>
        <Card className="card-standard border-none bg-background/50 backdrop-blur-sm md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-tiny text-muted-foreground">Armazenamento (Simulado)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-bold">1.8 GB</span>
              <span className="text-xs text-muted-foreground">de 10 GB (18%)</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden border">
              <div className="h-full bg-primary transition-all duration-1000" style={{ width: '18%' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-standard border-none bg-background/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b bg-muted/20 flex flex-col md:flex-row gap-4 items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="bg-background/50 border">
                <TabsTrigger value="all" className="text-xs font-bold">Todos</TabsTrigger>
                <TabsTrigger value="published" className="text-xs font-bold">Publicados</TabsTrigger>
                <TabsTrigger value="draft" className="text-xs font-bold">Rascunhos</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Buscar arquivos..." 
                  className="pl-9 h-10 bg-background border-none shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => setViewMode(v => v === "list" ? "grid" : "list")} className="h-10 w-10">
                {viewMode === "list" ? <LayoutGrid size={18} /> : <List size={18} />}
              </Button>
            </div>
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
                  {filteredDocs.length > 0 ? (
                    filteredDocs.map((doc) => (
                      <TableRow key={doc.id} className="group hover:bg-muted/20 transition-colors border-b-border/5">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {filteredDocs.map(doc => (
                <Card key={doc.id} className="card-standard group relative overflow-hidden h-44 flex flex-col justify-between p-4 border-none bg-muted/20 hover:bg-muted/40 cursor-pointer">
                   <div className="flex justify-between items-start">
                      <div className="p-3 bg-background rounded-lg shadow-sm text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <FileText size={24} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(doc.status)}
                      </div>
                   </div>
                   <div className="mt-4">
                      <h4 className="text-sm font-bold truncate pr-6">{doc.title}</h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                        {doc.category} • {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                   </div>
                   <div className="absolute top-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background shadow-sm">
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-xs font-bold"><Download size={14} className="mr-2" /> Baixar</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs font-bold" onClick={() => handleDelete(doc.id)}><Trash2 size={14} className="mr-2 text-destructive" /> Excluir</DropdownMenuItem>
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
  );
};

export default AdminDocuments;
