import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Download, Search, Calendar, Eye, Filter, Clock, CheckCircle, 
  Star, AlertTriangle, Archive, BarChart
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { documentService, Document } from "@/services/DocumentService";
import { StatsCard } from "@/components/shared/StatsCard";
import { DocumentPreviewDialog } from "@/components/Documents/DocumentPreviewDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useClientStage } from "@/hooks/useClientStage";

interface ClientDocument extends Omit<Document, 'status'> {
  size?: string;
  downloadUrl?: string;
  status: "disponivel" | "processando" | "vencido";
  description?: string;
}

const getTypeLabel = (type: string) => {
  const types = {
    auto: "Automático",
    manual: "Manual"
  };
  return types[type as keyof typeof types] || type;
};

const getTypeColor = (type: string) => {
  const colors = {
    auto: "default",
    manual: "secondary"
  };
  return colors[type as keyof typeof colors] || "outline";
};

const getStatusColor = (status: string) => {
  const colors = {
    disponivel: "default",
    processando: "secondary",
    vencido: "destructive"
  };
  return colors[status as keyof typeof colors] || "outline";
};

const getStatusLabel = (status: string) => {
  const labels = {
    disponivel: "Disponível",
    processando: "Processando",
    vencido: "Vencido"
  };
  return labels[status as keyof typeof labels] || status;
};

export default function ClientDocuments() {
  const { user } = useAuth();
  const clientId = user?.id || "client-1";
  const { profile } = useClientStage(clientId);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadClientDocuments();
  }, []);

  const loadClientDocuments = () => {
    const clientName = user?.name || "João Silva";
    const clientDocs = documentService.getDocumentsByClient(clientName);
    
    const formattedDocs: ClientDocument[] = clientDocs.map(doc => ({
      ...doc,
      size: doc.fileSize || `${Math.floor(Math.random() * 2000 + 500)} KB`,
      downloadUrl: doc.fileUrl || `/docs/${doc.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      status: doc.status === "published" ? "disponivel" : "processando" as any,
      description: getDocumentDescription(doc)
    }));

    setDocuments(formattedDocs);
  };

  const getDocumentDescription = (doc: Document): string => {
    if (doc.type === "auto") {
      return `Documento gerado automaticamente com base no template`;
    }
    return `Documento em formato ${doc.fileName?.split('.').pop()?.toUpperCase() || 'PDF'}`;
  };

  const filteredDocuments = documents.filter(doc => {
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && doc.type !== typeFilter) return false;
    if (statusFilter !== "all" && doc.status !== statusFilter) return false;
    return true;
  });

  const handleDownload = (doc: ClientDocument) => {
    if (doc.status === "processando") {
      toast({
        title: "Documento não disponível",
        description: "Este documento ainda está sendo processado.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      documentService.downloadDocument(doc.id);
      toast({
        title: "Download iniciado",
        description: `Baixando ${doc.title}...`
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Erro ao baixar o documento",
        variant: "destructive"
      });
    }
  };

  const handlePreview = (doc: ClientDocument) => {
    if (doc.status === "processando") {
      toast({
        title: "Documento não disponível",
        description: "Este documento ainda está sendo processado.",
        variant: "destructive"
      });
      return;
    }

    if (doc.type === "auto" && doc.template) {
      const clientData = {
        nome_cliente: "João Silva",
        endereco: "Rua das Flores, 123 - Apt 204",
        valor: "350.000,00",
        data: new Date().toLocaleDateString(),
        empreendimento: "Edifício Aurora",
        data_vistoria: "15/05/2025",
        responsavel_vistoria: "Carlos Santos",
        estado_geral: "Excelente",
        instalacoes_eletricas: "Conformes",
        instalacoes_hidraulicas: "Conformes",
        observacoes: "Imóvel em perfeitas condições"
      };

      try {
        const preview = documentService.generateDocument(doc.id, clientData);
        setPreviewContent(preview);
        setSelectedDoc(doc as any);
        setIsPreviewOpen(true);
      } catch (error) {
        toast({
          title: "Erro ao gerar preview",
          description: "Não foi possível gerar o preview do documento",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Abrindo documento",
        description: `Carregando ${doc.title}...`
      });
      window.open(doc.downloadUrl, '_blank');
    }
  };

  const categories = documentService.getCategories();
  
  const stats = {
    total: documents.length,
    disponivel: documents.filter(d => d.status === "disponivel").length,
    processando: documents.filter(d => d.status === "processando").length,
    thisMonth: documents.filter(d => d.createdAt.getMonth() === new Date().getMonth()).length,
    favorites: documents.filter(d => d.isFavorite).length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Meus Documentos
        </h1>
        <p className="text-muted-foreground mt-1">
          Acesse e baixe seus documentos relacionados ao imóvel
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            <FileText className="h-4 w-4 mr-2" />
            Todos
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Star className="h-4 w-4 mr-2" />
            Favoritos
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-2" />
            Recentes
          </TabsTrigger>
          <TabsTrigger value="contracts">
            <Archive className="h-4 w-4 mr-2" />
            Contratos
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart className="h-4 w-4 mr-2" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              label="Total de Arquivos" 
              value={stats.total} 
              icon={FileText} 
              variant="brand" 
            />
            <StatsCard 
              label="Disponíveis" 
              value={stats.disponivel} 
              icon={CheckCircle} 
              variant="complete" 
            />
            <StatsCard 
              label="Processando" 
              value={stats.processando} 
              icon={Clock} 
              variant="pending" 
            />
            <StatsCard 
              label="Novos este Mês" 
              value={stats.thisMonth} 
              icon={Calendar} 
              variant="brand" 
            />
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar documentos por título ou descrição..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas categorias</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="auto">Automáticos</SelectItem>
                    <SelectItem value="manual">Manuais</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos status</SelectItem>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="processando">Processando</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="card-standard group hover:shadow-lg transition-all border-none bg-background/50 backdrop-blur-sm overflow-hidden flex flex-col h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <FileText className="h-5 w-5" />
                    </div>
                    <Badge variant={getStatusColor(doc.status) as any} className="text-[10px] uppercase font-bold">
                      {getStatusLabel(doc.status)}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold line-clamp-2 min-h-[40px]">{doc.title}</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-tight mt-1">
                    {getTypeLabel(doc.type)} • {doc.size}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {doc.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 italic mb-4">{doc.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold mt-auto border-t pt-3">
                    <Calendar className="h-3 w-3" />
                    {doc.createdAt.toLocaleDateString()}
                    <Separator orientation="vertical" className="h-3" />
                    <span>{doc.downloads} downloads</span>
                  </div>
                </CardContent>
                <div className="p-4 pt-0 grid grid-cols-2 gap-2 mt-auto">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 text-[10px] font-bold uppercase"
                    onClick={() => handlePreview(doc)}
                    disabled={doc.status === "processando"}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Preview
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-8 text-[10px] font-bold uppercase"
                    onClick={() => handleDownload(doc)}
                    disabled={doc.status === "processando"}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Baixar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.filter(d => d.isFavorite).map((doc) => (
              <Card key={doc.id} className="card-standard border-yellow-200/50 bg-yellow-50/10">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-600">
                      <Star className="h-5 w-5 fill-current" />
                    </div>
                    <Badge variant={getStatusColor(doc.status) as any} className="text-[10px] uppercase font-bold">
                      {getStatusLabel(doc.status)}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold line-clamp-2">{doc.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold mt-2">
                    <Calendar className="h-3 w-3" />
                    {doc.createdAt.toLocaleDateString()}
                    <Separator orientation="vertical" className="h-3" />
                    <span>{doc.downloads} downloads</span>
                  </div>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button 
                    size="sm" 
                    className="w-full h-8 text-[10px] font-bold uppercase"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Baixar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="grid gap-4">
            {documents
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .slice(0, 5)
              .map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-md">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{doc.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDownload(doc)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="contracts">
          <div className="grid gap-4">
            {documents.filter(d => d.category === "contrato").map((doc) => (
              <Card key={doc.id} className="border-blue-200 bg-blue-50/5">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">{doc.title}</CardTitle>
                  <CardDescription>{doc.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                   <Badge variant="outline">{getStatusLabel(doc.status)}</Badge>
                   <Button size="sm" onClick={() => handleDownload(doc)}>
                     <Download className="h-4 w-4 mr-2" /> Baixar Contrato
                   </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map(cat => {
                    const count = documents.filter(d => d.category === cat.id).length;
                    return (
                      <div key={cat.id} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{cat.name}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mais Acessados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents
                    .sort((a, b) => b.downloads - a.downloads)
                    .slice(0, 5)
                    .map(doc => (
                      <div key={doc.id} className="flex justify-between items-center">
                        <span className="text-sm truncate mr-4">{doc.title}</span>
                        <Badge variant="outline" className="shrink-0">{doc.downloads} downloads</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <DocumentPreviewDialog 
        document={selectedDoc}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        generatedContent={previewContent}
      />
    </div>
  );
}
