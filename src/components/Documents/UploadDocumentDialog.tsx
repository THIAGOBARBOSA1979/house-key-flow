import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { documentService } from "@/services/DocumentService";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Save } from "lucide-react";

interface UploadDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadDocumentDialog({ isOpen, onClose, onSuccess }: UploadDocumentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormattedData] = useState<{
    title: string;
    category: string;
    description: string;
    priority: "low" | "medium" | "high";
    client: string;
    property: string;
    expiresAt: string;
  }>({
    title: "",
    category: "outros",
    description: "",
    priority: "medium",
    client: "",
    property: "",
    expiresAt: ""
  });

  const categories = documentService.getCategories();

  const handleUpload = async () => {
    if (!formData.title) {
      toast({
        title: "Campo obrigatório",
        description: "O título do documento é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      documentService.createDocument({
        title: formData.title,
        type: "manual",
        category: formData.category,
        description: formData.description,
        priority: formData.priority,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
        associatedTo: {
          client: formData.client,
          property: formData.property
        },
        visible: true,
        status: "published",
        createdBy: "Admin"
      });

      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso.",
      });
      onSuccess();
      onClose();
      setFormattedData({
        title: "",
        category: "outros",
        description: "",
        priority: "medium",
        client: "",
        property: "",
        expiresAt: ""
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o documento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
          <DialogTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
            <FileUp className="w-6 h-6 text-primary" />
            Upload de Documento
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto p-8">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Título do Documento</Label>
              <Input 
                id="title" 
                placeholder="Ex: Alvará de Construção 2025" 
                value={formData.title}
                onChange={(e) => setFormattedData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormattedData({...formData, category: val as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="shadow-sem-xl border-none">
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Prioridade</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(val) => setFormattedData({...formData, priority: val as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="shadow-sem-xl border-none">
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expiresAt">Data de Validade (Opcional)</Label>
              <Input 
                id="expiresAt"
                type="date"
                className="w-full"
                value={formData.expiresAt}
                onChange={(e) => setFormattedData({...formData, expiresAt: e.target.value})}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                placeholder="Breve descrição do conteúdo..." 
                value={formData.description}
                onChange={(e) => setFormattedData({...formData, description: e.target.value})}
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label>Cliente (Opcional)</Label>
                <Input 
                  placeholder="Nome do cliente" 
                  value={formData.client}
                  onChange={(e) => setFormattedData({...formData, client: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Empreendimento</Label>
                <Input 
                  placeholder="Nome do empreendimento" 
                  value={formData.property}
                  onChange={(e) => setFormattedData({...formData, property: e.target.value})}
                />
              </div>
            </div>

            <div 
              className="mt-4 p-10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center bg-muted/20 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer group shadow-sem-inner"
            >
              <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                <FileUp className="w-10 h-10" />
              </div>
              <p className="text-sm font-bold text-foreground">Clique ou arraste o arquivo aqui</p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase font-black tracking-widest">PDF, DOCX, JPG ou PNG (Máx 10MB)</p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 border-t border-border/10 bg-muted/5">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleUpload} disabled={loading} className="gap-2 min-w-[160px] font-black uppercase tracking-widest text-xs">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Documento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
