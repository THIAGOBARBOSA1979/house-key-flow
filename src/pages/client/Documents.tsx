import { useState, useEffect, useCallback } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
import { useToast } from "@/hooks/use-toast";
import { documentService, Document } from "@/services";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
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
  const types = { auto: "Automático", manual: "Manual" };
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
    if (statusFilter !== "all" && doc.status !== statusFilter) return false;
    return true;
  });

  const handleDownload = (doc: ClientDocument) => {
    if (doc.status === "processando") return;
    documentService.downloadDocument(doc.id);
    toast({ title: "Download iniciado", description: `Baixando ${doc.title}...` });
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
    <div className="space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-700">
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl shadow-sm border border-primary/20">
              <FileText className="h-8 w-8" />
            </div>
            Meus Documentos
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Acesse e assine seus documentos.</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-layout-gap">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all"><FileText className="h-4 w-4 mr-2" />Todos</TabsTrigger>
          <TabsTrigger value="favorites"><Star className="h-4 w-4 mr-2" />Favoritos</TabsTrigger>
          <TabsTrigger value="recent"><Clock className="h-4 w-4 mr-2" />Recentes</TabsTrigger>
          <TabsTrigger value="contracts"><Archive className="h-4 w-4 mr-2" />Contratos</TabsTrigger>
          <TabsTrigger value="stats"><BarChart className="h-4 w-4 mr-2" />Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-layout-gap pt-2">
          <ResponsiveGrid columns={4} gap="layout">
            <StatsCard label="Total" value={stats.total} icon={FileText} variant="brand" />
            <StatsCard label="Disponíveis" value={stats.disponivel} icon={CheckCircle} variant="complete" />
            <StatsCard label="Processando" value={stats.processando} icon={Clock} variant="pending" />
            <StatsCard label="Favoritos" value={stats.favorites} icon={Star} variant="brand" />
          </ResponsiveGrid>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Input placeholder="Buscar..." className="flex-1" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">Todas</SelectItem></SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="group border h-full rounded-2xl shadow-sm flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <FileText className="h-6 w-6 text-primary" />
                    <StatusBadge 
                      status={(doc as any).isSigned ? "complete" : (doc.status === "disponivel" ? "complete" : "progress")} 
                      label={(doc as any).isSigned ? "Assinado" : getStatusLabel(doc.status)}
                    />
                  </div>
                  <CardTitle className="text-base font-black mt-2">{doc.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-xs text-muted-foreground">{doc.description}</p>
                </CardContent>
                <div className="p-5 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handlePreview(doc)}>Preview</Button>
                    <Button size="sm" className="rounded-xl" onClick={() => handleDownload(doc)}>Baixar</Button>
                  </div>
                  {doc.category === 'contrato' && (
                    <Button variant="secondary" className="w-full rounded-xl" onClick={() => handleOpenSignature(doc)}>
                      {(doc as any).isSigned ? <ShieldCheck className="h-4 w-4 mr-2" /> : <PenTool className="h-4 w-4 mr-2" />}
                      {(doc as any).isSigned ? "Assinado" : "Assinar"}
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
