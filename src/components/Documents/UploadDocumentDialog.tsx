import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  const [formData, setFormattedData] = useState({
    title: "",
    category: "outros" as any,
    description: "",
    priority: "medium" as any,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-primary" />
            Upload de Documento
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título do Documento</Label>
            <Input 
              id="title" 
              placeholder="Ex: Alvará de Construção 2025" 
              value={formData.title}
              onChange={(e) => setFormattedData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormattedData({...formData, category: val as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                <SelectContent>
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            className="mt-2 p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-muted/30 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="p-3 rounded-full bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
              <FileUp className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-foreground">Clique ou arraste o arquivo aqui</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-black tracking-widest">PDF, DOCX, JPG ou PNG (Máx 10MB)</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleUpload} disabled={loading} className="gap-2">
            {loading ? "Enviando..." : (
              <>
                <Save className="w-4 h-4" />
                Salvar Documento
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
