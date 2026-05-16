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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Nome</Label>
              <Input 
                placeholder="Nome completo" 
                value={newSigner.name}
                onChange={(e) => setNewSigner({...newSigner, name: e.target.value})}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">E-mail</Label>
              <Input 
                placeholder="E-mail" 
                type="email"
                value={newSigner.email}
                onChange={(e) => setNewSigner({...newSigner, email: e.target.value})}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest">Papel</Label>
              <Select 
                value={newSigner.role} 
                onValueChange={(val) => setNewSigner({...newSigner, role: val})}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Comprador">Comprador</SelectItem>
                  <SelectItem value="Vendedor">Vendedor</SelectItem>
                  <SelectItem value="Testemunha">Testemunha</SelectItem>
                  <SelectItem value="Advogado">Advogado</SelectItem>
                  <SelectItem value="Engenheiro">Engenheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddSigner} className="w-full h-9 gap-2 font-bold text-xs uppercase tracking-widest">
                <UserPlus className="w-4 h-4" /> Add
              </Button>
            </div>
          </div>

          <div className="border rounded-2xl overflow-hidden shadow-sem-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[60px] text-center"><ListOrdered className="w-4 h-4 mx-auto" /></TableHead>
                  <TableHead>Signatário</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signatures.length > 0 ? (
                  signatures.map((s, index) => (
                    <TableRow key={s.id} className="group hover:bg-muted/10">
                      <TableCell className="text-center">
                        <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center rounded-full font-black text-[10px]">
                          {index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-sm">{s.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">{s.role} • {s.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1 font-bold text-[9px] uppercase">
                          {s.confirmationMethod === 'email' ? <Mail className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                          {s.confirmationMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-[9px] font-black uppercase tracking-tighter",
                          s.status === 'signed' ? "bg-green-500" : "bg-yellow-500"
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
