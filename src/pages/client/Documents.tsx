import { useState, useEffect, useCallback } from "react";
import { StatusBadge } from "@/components/Shared/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Download, Search, Calendar, Eye, Filter, Clock, CheckCircle, 
  Star, AlertTriangle, Archive, BarChart, PenTool, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DigitalSignatureDialog } from "@/components/Documents/DigitalSignatureDialog";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks";
import { documentService, Document } from "@/services";
import { StatsCard } from "@/components/Shared/StatsCard";
import { ResponsiveGrid } from "@/components/Shared/ResponsiveGrid";
import { DocumentPreviewDialog } from "@/components/Documents/DocumentPreviewDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useClientStage } from "@/hooks";
import { FeatureGate } from "@/components/ClientFlow/FeatureGate";

interface ClientDocument extends Omit<Document, 'status'> {
  size?: string;
  downloadUrl?: string;
  status: "disponivel" | "processando" | "vencido";
  description?: string;
}

const getTypeLabel = (type: string) => {
  const types = { auto: "Laudo ABNT", manual: "Manual/Projeto" };
  return types[type as keyof typeof types] || type;
};

const getStatusLabel = (status: string) => {
  const labels = { disponivel: "Disponível", processando: "Processando", vencido: "Vencido" };
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
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const { toast } = useToast();

  const loadClientDocuments = useCallback(() => {
    const clientName = user?.name || "João Silva";
    const clientDocs = documentService.getDocumentsByClient(clientName);
    setDocuments(clientDocs.map(doc => ({
      ...doc,
      size: doc.fileSize || `${Math.floor(Math.random() * 2000 + 500)} KB`,
      downloadUrl: doc.fileUrl || `/docs/${doc.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      status: doc.status === "published" ? "disponivel" : "processando" as any,
      description: doc.type === "auto" ? "Gerado automaticamente" : "Manual"
    })));
  }, [user?.name]);

  useEffect(() => {
    loadClientDocuments();
  }, [loadClientDocuments]);

  const filteredDocuments = documents.filter(doc => {
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && doc.type !== typeFilter) return false;
    if (statusFilter === "favorites" && !(doc as any).isFavorite) return false;
    if (statusFilter === "recent") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      if (doc.createdAt < oneWeekAgo) return false;
    }
    if (statusFilter !== "all" && statusFilter !== "favorites" && statusFilter !== "recent" && doc.status !== statusFilter) return false;
    return true;
  });

  const handleDownload = (doc: ClientDocument) => {
    if (doc.status === "processando") return;
    documentService.downloadDocument(doc.id);
    loadClientDocuments(); // Refresh to update download count if shown
    toast({ title: "Download iniciado", description: `Baixando ${doc.title}...` });
  };

  const handleToggleFavorite = (docId: string) => {
    const success = documentService.toggleFavorite(docId);
    if (success) {
      loadClientDocuments();
      toast({ 
        title: "Favorito atualizado", 
        description: "Suas preferências de documentos foram sincronizadas." 
      });
    }
  };

  const handlePreview = (doc: ClientDocument) => {
    if (doc.status === "processando") return;
    if (doc.type === "auto" && doc.template) {
      const generated = documentService.generateDocument(doc.id, {});
      setPreviewContent(generated.template || "");
      setSelectedDoc(generated);
      setIsPreviewOpen(true);
    } else {
      window.open(doc.downloadUrl, '_blank');
    }
  };

  const handleOpenSignature = (doc: ClientDocument) => {
    setSelectedDoc(doc as any);
    setIsSignatureOpen(true);
  };

  const stats = {
    total: documents.length,
    disponivel: documents.filter(d => d.status === "disponivel").length,
    processando: documents.filter(d => d.status === "processando").length,
    thisMonth: documents.filter(d => d.createdAt.getMonth() === new Date().getMonth()).length,
    favorites: documents.filter(d => (d as any).isFavorite).length
  };

  return (
    <div className="container-responsive py-layout-gap space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-slow">
      {selectedDoc && (
        <DigitalSignatureDialog
          isOpen={isSignatureOpen}
          onClose={() => setIsSignatureOpen(false)}
          documentId={selectedDoc.id}
          documentTitle={selectedDoc.title}
        />
      )}
      <DocumentPreviewDialog 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)}
        generatedContent={previewContent}
        document={selectedDoc as any}
      />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-4 text-foreground leading-tight">
            <div className="p-3 bg-primary/10 rounded-2xl shadow-inner border border-primary/20 text-primary">
              <FileText className="h-8 w-8" strokeWidth={3} />
            </div>
            Meus Documentos & Contratos
          </h1>
          <p className="text-muted-foreground mt-2 font-bold text-sm">Gerenciamento seguro de contratos, plantas e manuais técnicos da unidade.</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-layout-gap" onValueChange={(val) => {
        if (val === 'favorites') setStatusFilter('favorites');
        else if (val === 'recent') setStatusFilter('recent');
        else setStatusFilter('all');
      }}>
        <TabsList className="flex w-full overflow-x-auto no-scrollbar bg-muted/50 p-1 rounded-2xl h-auto min-h-12">
          <TabsTrigger value="all" className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest"><FileText className="h-4 w-4 mr-2" />Todos</TabsTrigger>
          <TabsTrigger value="favorites" className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest"><Star className="h-4 w-4 mr-2" />Favoritos</TabsTrigger>
          <TabsTrigger value="recent" className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest"><Clock className="h-4 w-4 mr-2" />Recentes</TabsTrigger>
          <TabsTrigger value="contracts" className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest"><Archive className="h-4 w-4 mr-2" />Contratos</TabsTrigger>
          <TabsTrigger value="stats" className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest"><BarChart className="h-4 w-4 mr-2" />Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-layout-gap pt-2">
          <ResponsiveGrid columns={4} gap="layout">
            <StatsCard label="Total" value={stats.total} icon={FileText} variant="brand" className="rounded-[2rem] border-none shadow-sem-sm" />
            <StatsCard label="Disponíveis" value={stats.disponivel} icon={CheckCircle} variant="complete" className="rounded-[2rem] border-none shadow-sem-sm" />
            <StatsCard label="Processando" value={stats.processando} icon={Clock} variant="pending" className="rounded-[2rem] border-none shadow-sem-sm" />
            <StatsCard label="Favoritos" value={stats.favorites} icon={Star} variant="brand" className="rounded-[2rem] border-none shadow-sem-sm" />
          </ResponsiveGrid>

      <Card className="rounded-[2rem] border-none shadow-sem-lg overflow-hidden bg-white/70 backdrop-blur-md">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all" />
              <Input 
                placeholder="Localizar contrato, planta ou manual..." 
                className="pl-12 h-14 rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 transition-all font-bold text-base" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[240px] h-14 rounded-2xl border-none bg-muted/30 font-bold px-6">
                  <div className="flex items-center gap-3">
                    <Filter size={18} className="text-primary" />
                    <SelectValue placeholder="Categoria" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-sem-xl">
                  <SelectItem value="all" className="rounded-xl font-bold">Todas Categorias</SelectItem>
                  <SelectItem value="contrato" className="rounded-xl font-bold">Contratos & Aditivos</SelectItem>
                  <SelectItem value="planta" className="rounded-xl font-bold">Plantas & Projetos</SelectItem>
                  <SelectItem value="manual" className="rounded-xl font-bold">Manuais Técnicos</SelectItem>
                  <SelectItem value="financeiro" className="rounded-xl font-bold">Financeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="group border-none h-full rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden bg-card/50 backdrop-blur-sm">
                <div className="h-2 w-full bg-gradient-to-r from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                      <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 group-hover:rotate-6 transition-transform">
                        <FileText className="h-7 w-7" />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "rounded-xl h-10 w-10 transition-all",
                          (doc as any).isFavorite ? "text-amber-500 fill-amber-500 bg-amber-50" : "text-muted-foreground hover:bg-primary/5"
                        )}
                        onClick={() => handleToggleFavorite(doc.id)}
                      >
                        <Star size={18} strokeWidth={2.5} />
                      </Button>
                    </div>
                    <StatusBadge 
                      status={(doc as any).isSigned ? "complete" : (doc.status === "disponivel" ? "complete" : "progress")} 
                      label={(doc as any).isSigned ? "Assinado" : getStatusLabel(doc.status)}
                      size="sm"
                    />
                  </div>
                  <CardTitle className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors">{doc.title}</CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">{doc.category || "Documentação Geral"}</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8 flex-1">
                  <p className="text-sm text-muted-foreground font-medium line-clamp-3 leading-relaxed">{doc.description}</p>
                  
                  <div className="flex items-center gap-4 mt-6 p-3 bg-muted/30 rounded-xl border border-border/5">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-wider">Tamanho</span>
                      <span className="text-xs font-black">{doc.fileSize || "1.2 MB"}</span>
                    </div>
                    <Separator orientation="vertical" className="h-8 opacity-50" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-wider">Formato</span>
                      <span className="text-xs font-black">PDF</span>
                    </div>
                  </div>
                </CardContent>
                <div className="p-8 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="rounded-xl font-bold h-10 border-2" onClick={() => handlePreview(doc)}>
                      <Eye className="h-4 w-4 mr-2" /> Preview
                    </Button>
                    <Button size="sm" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 shadow-lg shadow-primary/20" onClick={() => handleDownload(doc)}>
                      <Download className="h-4 w-4 mr-2" /> Baixar
                    </Button>
                  </div>
                  {doc.category === 'contrato' && (
                    <Button variant="secondary" className="w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-11 border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all" onClick={() => handleOpenSignature(doc)}>
                      {(doc as any).isSigned ? <ShieldCheck className="h-4 w-4 mr-2" /> : <PenTool className="h-4 w-4 mr-2" />}
                      {(doc as any).isSigned ? "Protocolo Assinado" : "Assinar Documento"}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
