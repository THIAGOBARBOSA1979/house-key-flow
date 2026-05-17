import { useState, useMemo } from "react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Megaphone, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Globe, 
  Building,
  Calendar,
  Eye,
  Send,
  Bell
} from "lucide-react";
import { constructionService, type ConstructionUpdate } from "@/services/ConstructionService";
import { propertyService } from "@/services/PropertyService";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const Announcements = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [updates, setUpdates] = useState<ConstructionUpdate[]>(constructionService.getUpdates());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const properties = useMemo(() => propertyService.getAll(), []);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "news" as ConstructionUpdate['type'],
    isGlobal: true,
    propertyId: "all",
    status: "published" as ConstructionUpdate['status']
  });

  const filteredUpdates = useMemo(() => {
    return updates.filter(u => 
      u.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [updates, searchTerm]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      type: "news",
      isGlobal: true,
      propertyId: "all",
      status: "published"
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (update: ConstructionUpdate) => {
    setEditingId(update.id);
    setFormData({
      title: update.title,
      description: update.description,
      type: update.type,
      isGlobal: update.isGlobal || false,
      propertyId: "all", // In a real app we'd have the property ID
      status: update.status || 'published'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    constructionService.deleteUpdate(id);
    setUpdates(constructionService.getUpdates());
    toast({
      title: "Comunicado removido",
      description: "O comunicado foi excluído permanentemente.",
      variant: "destructive"
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o título e a descrição.",
        variant: "destructive"
      });
      return;
    }

    if (editingId) {
      constructionService.updateUpdate(editingId, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        isGlobal: formData.isGlobal,
        status: formData.status
      });
      toast({ title: "Sucesso", description: "Comunicado atualizado com sucesso." });
    } else {
      constructionService.createUpdate({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        isGlobal: formData.isGlobal,
        status: formData.status,
        date: new Date()
      });
      toast({ title: "Sucesso", description: "Novo comunicado publicado." });
    }

    setUpdates(constructionService.getUpdates());
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <PageHeader
        icon={Megaphone}
        title="Comunicados e Notícias"
        description="Gerencie as comunicações diretas com os clientes e atualizações de obra."
      >
        <Button onClick={handleOpenCreate} className="rounded-xl h-11 px-6 font-black uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" strokeWidth={3} /> Criar Comunicado
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 rounded-3xl border-none bg-primary/5 shadow-none p-6 space-y-4">
          <div className="p-3 bg-white w-fit rounded-2xl shadow-sm">
            <Bell className="text-primary w-6 h-6" />
          </div>
          <h3 className="text-lg font-black tracking-tight">Canais de Comunicação</h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Seus comunicados aparecem no feed principal dos clientes no Painel do Cliente.
          </p>
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <Globe size={14} /> Global (Todos os clientes)
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <Building size={14} /> Por Empreendimento
            </div>
          </div>
        </Card>

        <div className="md:col-span-3 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Buscar por título ou conteúdo do comunicado..." 
              className="pl-11 h-12 rounded-2xl border-none bg-card/50 backdrop-blur-md shadow-sem-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <DataTable
            columns={[
              { 
                header: "Data", 
                accessorKey: "date",
                cell: (item) => (
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">{formatDate(item.date)}</span>
                    <span className="text-[10px] text-muted-foreground font-black uppercase">Às {new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )
              },
              { 
                header: "Título", 
                accessorKey: "title",
                cell: (item) => (
                  <div className="max-w-[250px]">
                    <span className="font-black text-foreground block truncate">{item.title}</span>
                    <span className="text-xs text-muted-foreground font-medium line-clamp-1">{item.description}</span>
                  </div>
                )
              },
              { 
                header: "Público", 
                accessorKey: "isGlobal",
                cell: (item) => (
                  <div className="flex flex-col gap-1">
                    {item.isGlobal ? (
                      <Badge variant="outline" className="rounded-lg bg-purple-50 text-purple-700 border-purple-200 gap-1 font-bold text-[10px] uppercase w-fit">
                        <Globe size={10} /> Global
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-lg bg-blue-50 text-blue-700 border-blue-200 gap-1 font-bold text-[10px] uppercase w-fit">
                        <Building size={10} /> Específico
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                      <Eye size={10} /> {item.readBy?.length || 0} leituras
                    </div>
                  </div>
                )
              },
              { 
                header: "Status", 
                accessorKey: "status",
                cell: (item) => (
                  <StatusBadge 
                    status={item.status === 'published' ? 'complete' : item.status === 'scheduled' ? 'pending' : 'neutral'} 
                    label={item.status === 'published' ? 'Publicado' : item.status === 'scheduled' ? 'Agendado' : 'Rascunho'} 
                    size="sm" 
                  />
                )
              },
              { 
                header: "Tipo", 
                accessorKey: "type",
                cell: (item) => {
                  const types: Record<string, string> = {
                    news: 'Notícia',
                    milestone: 'Marco de Obra',
                    photo: 'Galeria',
                    document: 'Documento'
                  };
                  return <span className="text-[10px] font-black uppercase tracking-widest bg-muted/50 px-2 py-1 rounded-lg">{types[item.type] || item.type}</span>;
                }
              },
              {
                header: "Ações",
                accessorKey: "id",
                className: "text-right",
                cell: (item) => (
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/5" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-destructive hover:bg-destructive/5" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              }
            ]}
            data={filteredUpdates}
          />
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl border-none shadow-sem-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Megaphone className="text-primary" />
              {editingId ? "Editar Comunicado" : "Novo Comunicado"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Título do Comunicado</label>
              <Input 
                placeholder="Ex: Novo Plantão de Vendas Disponível" 
                className="rounded-xl border-muted bg-muted/20 h-12"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Tipo</label>
                <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="rounded-xl border-muted bg-muted/20 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-sem-lg">
                    <SelectItem value="news">Notícia</SelectItem>
                    <SelectItem value="milestone">Marco de Obra</SelectItem>
                    <SelectItem value="photo">Atualização Fotográfica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Destinatários</label>
                <Select value={formData.isGlobal ? "global" : "specific"} onValueChange={(v) => setFormData({...formData, isGlobal: v === "global"})}>
                  <SelectTrigger className="rounded-xl border-muted bg-muted/20 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-sem-lg">
                    <SelectItem value="global">Todos os Clientes</SelectItem>
                    <SelectItem value="specific">Empreendimento Específico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!formData.isGlobal && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Selecionar Empreendimento</label>
                <Select value={formData.propertyId} onValueChange={(v) => setFormData({...formData, propertyId: v})}>
                  <SelectTrigger className="rounded-xl border-muted bg-muted/20 h-12">
                    <SelectValue placeholder="Selecione o projeto..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-sem-lg">
                    <SelectItem value="all">Todos</SelectItem>
                    {properties.map(p => (
                      <SelectItem key={p.id} value={p.id!}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Conteúdo</label>
              <Textarea 
                placeholder="Descreva aqui os detalhes do seu comunicado..." 
                className="rounded-xl border-muted bg-muted/20 min-h-[150px] resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12 font-bold">Cancelar</Button>
            <Button onClick={handleSubmit} className="rounded-xl h-12 px-8 font-black uppercase text-[11px] tracking-widest shadow-lg shadow-primary/20">
              <Send className="mr-2 h-4 w-4" /> {editingId ? "Salvar Alterações" : "Publicar Agora"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Announcements;