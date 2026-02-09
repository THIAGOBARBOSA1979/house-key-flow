import { useState, useEffect } from "react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Plus, Search, Upload, Download, Edit, Trash2, Eye, Save, X, 
  Star, Clock, AlertTriangle, Copy, Archive, BarChart, History, TrendingUp
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { documentService, Document } from "@/services/DocumentService";
import { useToast } from "@/components/ui/use-toast";
import { DocumentsDashboard } from "@/components/Documents/DocumentsDashboard";
import { DocumentFilters } from "@/components/Documents/DocumentFilters";
import { BulkActions } from "@/components/Documents/BulkActions";
import { DocumentVersionHistory } from "@/components/Documents/DocumentVersionHistory";
import { DocumentAnalytics } from "@/components/Documents/DocumentAnalytics";

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    type: "auto" as "auto" | "manual",
    template: "",
    category: "outros" as any,
    associatedProperty: "",
    associatedClient: "",
    visible: true,
    status: "draft" as "draft" | "published" | "archived",
    tags: "",
    priority: "medium" as "low" | "medium" | "high",
    description: "",
    expiresAt: ""
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const docs = documentService.getAllDocuments();
    setDocuments(docs);
    setFilteredDocuments(docs);
  };

  const handleSearch = (query: string, filters: any) => {
    const filtered = documentService.searchDocuments(query, filters);
    setFilteredDocuments(filtered);
    setActiveFilters(filters);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setFilteredDocuments(documents);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "auto",
      template: "",
      category: "outros",
      associatedProperty: "",
      associatedClient: "",
      visible: true,
      status: "draft",
      tags: "",
      priority: "medium",
      description: "",
      expiresAt: ""
    });
  };

  const handleCreateDocument = () => {
    if (!formData.title) {
      toast({
        title: "Erro",
        description: "Título é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      const newDocument = documentService.createDocument({
        title: formData.title,
        type: formData.type,
        template: formData.template || undefined,
        category: formData.category,
        associatedTo: {
          property: formData.associatedProperty || undefined,
          client: formData.associatedClient || undefined
        },
        visible: formData.visible,
        status: formData.status,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
        priority: formData.priority,
        description: formData.description,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
        createdBy: "Admin"
      });

      setDocuments(prev => [...prev, newDocument]);
      setFilteredDocuments(prev => [...prev, newDocument]);
      setIsCreateDialogOpen(false);
      resetForm();

      toast({
        title: "Sucesso",
        description: "Documento criado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar documento",
        variant: "destructive"
      });
    }
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDocument(doc);
    setFormData({
      title: doc.title,
      type: doc.type,
      template: doc.template || "",
      category: doc.category,
      associatedProperty: doc.associatedTo.property || "",
      associatedClient: doc.associatedTo.client || "",
      visible: doc.visible,
      status: doc.status,
      tags: doc.tags?.join(', ') || "",
      priority: doc.priority,
      description: doc.description || "",
      expiresAt: doc.expiresAt ? doc.expiresAt.toISOString().split('T')[0] : ""
    });
  };

  const handleUpdateDocument = () => {
    if (!editingDocument) return;

    try {
      const updatedDoc = documentService.updateDocument(editingDocument.id, {
        title: formData.title,
        template: formData.template || undefined,
        category: formData.category,
        associatedTo: {
          property: formData.associatedProperty || undefined,
          client: formData.associatedClient || undefined
        },
        visible: formData.visible,
        status: formData.status,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
        priority: formData.priority,
        description: formData.description,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined
      });

      if (updatedDoc) {
        setDocuments(prev => prev.map(doc => 
          doc.id === editingDocument.id ? updatedDoc : doc
        ));
        setFilteredDocuments(prev => prev.map(doc => 
          doc.id === editingDocument.id ? updatedDoc : doc
        ));
        setEditingDocument(null);
        resetForm();

        toast({
          title: "Sucesso",
          description: "Documento atualizado com sucesso"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar documento",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDocument = (id: string) => {
    try {
      const success = documentService.deleteDocument(id);
      if (success) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        setFilteredDocuments(prev => prev.filter(doc => doc.id !== id));
        toast({
          title: "Sucesso",
          description: "Documento excluído com sucesso"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir documento",
        variant: "destructive"
      });
    }
  };

  const handlePreviewDocument = (doc: Document) => {
    if (doc.type === "auto" && doc.template) {
      // Gerar preview com dados de exemplo
      const sampleData = {
        nome_cliente: "João Silva",
        endereco: "Rua das Flores, 123",
        valor: "350.000,00",
        data: new Date().toLocaleDateString(),
        empreendimento: "Edifício Aurora"
      };
      
      const preview = documentService.generateDocument(doc.id, sampleData);
      setPreviewContent(preview);
      setIsPreviewDialogOpen(true);
    } else {
      toast({
        title: "Preview não disponível",
        description: "Preview disponível apenas para documentos automáticos"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadProgress(0);
    
    try {
      // Simular progresso de upload
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      const fileUrl = await documentService.uploadFile(file);
      
      // Criar documento automaticamente após upload
      const newDocument = documentService.createDocument({
        title: file.name.replace('.pdf', ''),
        type: "manual",
        fileUrl,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        category: "outros",
        associatedTo: {},
        visible: true,
        status: "published",
        priority: "medium",
        createdBy: "Admin"
      });

      setDocuments(prev => [...prev, newDocument]);
      setFilteredDocuments(prev => [...prev, newDocument]);
      setUploadProgress(0);

      toast({
        title: "Upload concluído",
        description: `Arquivo ${file.name} enviado com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Erro ao enviar arquivo",
        variant: "destructive"
      });
      setUploadProgress(0);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const handleToggleFavorite = (id: string) => {
    try {
      const success = documentService.toggleFavorite(id);
      if (success) {
        loadDocuments();
        toast({
          title: "Sucesso",
          description: "Favorito atualizado com sucesso"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar favorito",
        variant: "destructive"
      });
    }
  };

  const handleDuplicate = (id: string) => {
    try {
      const duplicated = documentService.duplicateDocument(id);
      if (duplicated) {
        loadDocuments();
        toast({
          title: "Sucesso",
          description: "Documento duplicado com sucesso"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao duplicar documento",
        variant: "destructive"
      });
    }
  };

  const handleRestoreVersion = (documentId: string, versionId: string) => {
    try {
      // Lógica para restaurar versão anterior
      console.log('Restaurando versão:', versionId, 'do documento:', documentId);
      toast({
        title: "Versão restaurada",
        description: "A versão anterior foi restaurada com sucesso"
      });
      loadDocuments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao restaurar versão",
        variant: "destructive"
      });
    }
  };

  const templateVariables = documentService.getTemplateVariables();
  const categories = documentService.getCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={FileText}
        title="Documentos"
        description={`Gerencie modelos de documentos e arquivos (${documents.length} documentos)`}
      >
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Documento
        </Button>
      </PageHeader>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Documento</DialogTitle>
                <DialogDescription>
                  Crie um novo modelo de documento ou faça upload de um arquivo
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="auto" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="auto" onClick={() => setFormData(prev => ({...prev, type: "auto"}))}>
                    Modelo Automático
                  </TabsTrigger>
                  <TabsTrigger value="manual" onClick={() => setFormData(prev => ({...prev, type: "manual"}))}>
                    Upload Manual
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="auto" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título do Documento</Label>
                      <Input 
                        id="title" 
                        placeholder="Ex: Contrato de Compra e Venda"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({...prev, status: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="published">Publicado</SelectItem>
                          <SelectItem value="archived">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="template">Modelo do Documento</Label>
                    <Textarea 
                      id="template" 
                      placeholder="Digite o modelo usando variáveis como nome_cliente, endereco, valor"
                      rows={12}
                      value={formData.template}
                      onChange={(e) => setFormData(prev => ({...prev, template: e.target.value}))}
                    />
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2">Variáveis disponíveis:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {templateVariables.map(variable => (
                          <code key={variable.key} className="bg-muted px-2 py-1 rounded text-xs">
                            {`{{${variable.key}}}`}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="manual" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title-manual">Título do Documento</Label>
                    <Input 
                      id="title-manual" 
                      placeholder="Ex: Manual do Proprietário"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Arquivo PDF</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Clique para fazer upload ou arraste o arquivo aqui
                      </p>
                      <Input 
                        type="file" 
                        accept=".pdf,.doc,.docx" 
                        className="mt-2" 
                        onChange={handleFileUpload}
                      />
                      {uploadProgress > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Input 
                    placeholder="Nome do cliente (opcional)"
                    value={formData.associatedClient}
                    onChange={(e) => setFormData(prev => ({...prev, associatedClient: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Visível para Cliente</Label>
                  <Select value={formData.visible.toString()} onValueChange={(value) => setFormData(prev => ({...prev, visible: value === "true"}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags (separadas por vírgula)</Label>
                <Input 
                  placeholder="Ex: contrato, venda, importante"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({...prev, tags: e.target.value}))}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {setIsCreateDialogOpen(false); resetForm();}}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateDocument}>
                  <Save className="mr-2 h-4 w-4" />
                  Criar Documento
                </Button>
              </div>
            </DialogContent>
      </Dialog>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Star className="h-4 w-4 mr-2" />
            Favoritos
          </TabsTrigger>
          <TabsTrigger value="expiring">
            <Clock className="h-4 w-4 mr-2" />
            Vencendo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DocumentsDashboard />
        </TabsContent>

        <TabsContent value="analytics">
          <DocumentAnalytics />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          {/* Filtros */}
          <DocumentFilters 
            onSearch={handleSearch}
            activeFilters={activeFilters}
            onClearFilters={handleClearFilters}
          />

          {/* Ações em massa */}
          <BulkActions
            documents={filteredDocuments}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onActionComplete={loadDocuments}
          />

          {/* Lista de documentos com histórico de versões */}
          <div className="grid gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedIds.includes(doc.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedIds(prev => [...prev, doc.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== doc.id));
                          }
                        }}
                      />
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {doc.title}
                          {doc.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {doc.description || "Sem descrição"}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <span>Criado em {doc.createdAt.toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{doc.downloads} downloads</span>
                          <span>•</span>
                          <span>v{doc.version}</span>
                          {doc.expiresAt && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600">
                                Vence em {doc.expiresAt.toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={doc.type === "auto" ? "default" : "secondary"}>
                        {doc.type === "auto" ? "Automático" : "Manual"}
                      </Badge>
                      <Badge variant={getPriorityColor(doc.priority) as any}>
                        {doc.priority === "high" ? "Alta" : doc.priority === "medium" ? "Média" : "Baixa"}
                      </Badge>
                      <Badge variant="outline">
                        {categories.find(c => c.id === doc.category)?.name || doc.category}
                      </Badge>
                      <Badge variant={doc.status === "published" ? "default" : doc.status === "draft" ? "secondary" : "outline"}>
                        {doc.status === "published" ? "Publicado" : doc.status === "draft" ? "Rascunho" : "Arquivado"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <strong>Associado a:</strong> {
                        Object.entries(doc.associatedTo)
                          .filter(([_, value]) => value)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ") || "Nenhuma associação"
                      }
                    </div>

                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {doc.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => handleToggleFavorite(doc.id)}>
                        <Star className={`mr-2 h-4 w-4 ${doc.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                        {doc.isFavorite ? 'Remover' : 'Favoritar'}
                      </Button>
                      
                      {doc.type === "auto" && (
                        <Button size="sm" variant="outline" onClick={() => handlePreviewDocument(doc)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline" onClick={() => documentService.downloadDocument(doc.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      
                      <Button size="sm" variant="outline" onClick={() => handleDuplicate(doc.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </Button>
                      
                      <Button size="sm" variant="outline" onClick={() => handleEditDocument(doc)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o documento "{doc.title}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteDocument(doc.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum documento encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou criar um novo documento
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          <div className="grid gap-4">
            {documentService.getFavoriteDocuments().map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                {/* Enhanced favorite documents layout */}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="grid gap-4">
            {documents
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .slice(0, 10)
              .map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  {/* Recent documents layout */}
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="contracts">
          <div className="grid gap-4">
            {documents.filter(d => d.category === "contrato").map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow border-blue-200">
                {/* Contract documents layout */}
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
                        <span>{cat.name}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade de Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents
                    .sort((a, b) => b.downloads - a.downloads)
                    .slice(0, 5)
                    .map(doc => (
                      <div key={doc.id} className="flex justify-between items-center">
                        <span className="text-sm">{doc.title}</span>
                        <Badge variant="outline">{doc.downloads} downloads</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Preview do Documento</DialogTitle>
            <DialogDescription>
              Visualização com dados de exemplo
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap p-4 bg-muted rounded text-sm font-mono">
              {previewContent}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
