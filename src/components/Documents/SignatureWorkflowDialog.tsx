import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { documentService, DocumentSignature } from "@/services/DocumentService";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Mail, Smartphone, ShieldCheck, ListOrdered } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SignatureWorkflowDialogProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SignatureWorkflowDialog({ documentId, isOpen, onClose, onSuccess }: SignatureWorkflowDialogProps) {
  const { toast } = useToast();
  const [signatures, setSignatures] = useState<DocumentSignature[]>([]);
  const [newSigner, setNewSigner] = useState({
    name: "",
    email: "",
    role: "Comprador",
    confirmationMethod: "email" as "email" | "sms"
  });

  useEffect(() => {
    if (isOpen && documentId) {
      const doc = documentService.getDocumentById(documentId);
      if (doc?.signatures) {
        setSignatures([...doc.signatures]);
      } else {
        setSignatures([]);
      }
    }
  }, [isOpen, documentId]);

  const handleAddSigner = () => {
    if (!newSigner.name || !newSigner.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e e-mail são necessários.",
        variant: "destructive"
      });
      return;
    }

    const signer: Omit<DocumentSignature, 'id' | 'status'> = {
      ...newSigner,
      order: signatures.length + 1
    };

    const added = documentService.addSigner(documentId, signer);
    if (added) {
      setSignatures([...signatures, added]);
      setNewSigner({
        name: "",
        email: "",
        role: "Comprador",
        confirmationMethod: "email"
      });
      toast({
        title: "Signatário Adicionado",
        description: `${newSigner.name} foi incluído no fluxo de assinatura.`
      });
    }
  };

  const handleRemoveSigner = (signerId: string) => {
    const doc = documentService.getDocumentById(documentId);
    if (doc && doc.signatures) {
      const updatedSignatures = doc.signatures.filter(s => s.id !== signerId);
      documentService.updateDocument(documentId, { signatures: updatedSignatures });
      setSignatures(updatedSignatures);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
          <DialogTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Configurar Fluxo de Assinatura
          </DialogTitle>
          <DialogDescription>
            Defina quem precisa assinar este documento e em qual ordem.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Novo Signatário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-muted/20 p-6 rounded-3xl border border-border/50 shadow-inner">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Nome Completo</Label>
                <Input 
                  placeholder="Ex: João da Silva" 
                  value={newSigner.name}
                  onChange={(e) => setNewSigner({...newSigner, name: e.target.value})}
                  className="h-10 text-xs rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">E-mail</Label>
                <Input 
                  placeholder="email@exemplo.com" 
                  type="email"
                  value={newSigner.email}
                  onChange={(e) => setNewSigner({...newSigner, email: e.target.value})}
                  className="h-10 text-xs rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Papel / Função</Label>
                <Select 
                  value={newSigner.role} 
                  onValueChange={(val) => setNewSigner({...newSigner, role: val})}
                >
                  <SelectTrigger className="h-10 text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-sem-xl">
                    <SelectItem value="Comprador">Comprador</SelectItem>
                    <SelectItem value="Vendedor">Vendedor</SelectItem>
                    <SelectItem value="Testemunha">Testemunha</SelectItem>
                    <SelectItem value="Fiador">Fiador</SelectItem>
                    <SelectItem value="Advogado">Advogado</SelectItem>
                    <SelectItem value="Engenheiro">Engenheiro</SelectItem>
                    <SelectItem value="Diretor">Diretor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddSigner} className="w-full h-10 gap-2 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:translate-y-[-2px] transition-all">
                  <UserPlus className="w-4 h-4" /> Adicionar
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fluxo de Assinaturas Ativo</h3>
              <Badge variant="outline" className="text-[9px] font-black uppercase bg-primary/5 text-primary">Sequencial Ativado</Badge>
            </div>
            <div className="border rounded-3xl overflow-hidden shadow-sem-sm border-border/60">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent border-b-border/60">
                    <TableHead className="w-[80px] text-center font-black text-[10px] uppercase tracking-widest">Ordem</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Signatário</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Notificação</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase tracking-widest pr-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signatures.length > 0 ? (
                    signatures.map((s, index) => (
                      <TableRow key={s.id} className="group hover:bg-muted/10 transition-colors border-b-border/40">
                        <TableCell className="text-center">
                          <div className="relative inline-flex items-center justify-center">
                            <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Badge variant="outline" className="h-8 w-8 p-0 flex items-center justify-center rounded-full font-black text-xs bg-background relative border-2 border-primary/20 group-hover:border-primary transition-all">
                              {s.order || index + 1}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-black text-sm text-foreground/90">{s.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{s.role} • {s.email}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="gap-1.5 font-black text-[9px] uppercase tracking-widest py-1 px-2.5 rounded-lg bg-muted/60">
                            {s.confirmationMethod === 'email' ? <Mail className="w-3 h-3 text-primary/70" /> : <Smartphone className="w-3 h-3 text-primary/70" />}
                            {s.confirmationMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-[9px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-sm",
                            s.status === 'signed' ? "bg-green-500 hover:bg-green-600" : "bg-amber-500 hover:bg-amber-600"
                          )}>
                            {s.status === 'signed' ? 'Assinado' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveSigner(s.id)}
                            disabled={s.status === 'signed'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic text-sm">
                        Nenhum signatário adicionado a este fluxo.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 border-t bg-muted/5">
          <Button variant="outline" onClick={onClose} className="font-bold">Fechar</Button>
          <Button onClick={() => { onSuccess(); onClose(); }} className="gap-2 font-black uppercase tracking-widest text-[11px]">
            Finalizar Configuração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
