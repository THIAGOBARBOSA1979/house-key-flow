
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, History, PenTool, Mail, Smartphone, ShieldCheck } from "lucide-react";
import { documentService, DocumentSignature } from "@/services/DocumentService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface DigitalSignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}

export function DigitalSignatureDialog({
  isOpen,
  onClose,
  documentId,
  documentTitle,
}: DigitalSignatureDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [signatures, setSignatures] = useState<DocumentSignature[]>([]);
  const [activeTab, setActiveTab] = useState("signers");

  // Load signatures when dialog opens
  useState(() => {
    if (documentId) {
      setSignatures(documentService.getSignatureHistory(documentId));
    }
  });

  const currentUserSignature = signatures.find(s => s.email === user?.email);
  const canSign = currentUserSignature && currentUserSignature.status === 'pending';

  const handleSign = () => {
    if (!currentUserSignature) return;

    // Simulate getting IP and browser info
    const ipAddress = "189.12.34." + Math.floor(Math.random() * 255);
    const evidence = {
      browser: "Chrome 124.0.0.0",
      os: "Windows 11",
      location: "São Paulo, SP, BR"
    };
    
    const success = documentService.signDocument(documentId, currentUserSignature.id, ipAddress, evidence);
    if (success) {
      toast({
        title: "Documento assinado",
        description: "Sua assinatura digital foi registrada com sucesso.",
      });
      setSignatures(documentService.getSignatureHistory(documentId));
      setActiveTab("history");
    }
  };

  const handleReject = () => {
    if (!currentUserSignature) return;
    
    const reason = prompt("Por favor, informe o motivo da recusa:");
    if (reason) {
      const success = documentService.rejectSignature(documentId, currentUserSignature.id, reason);
      if (success) {
        toast({
          title: "Assinatura Recusada",
          description: "O documento foi marcado como recusado.",
          variant: "destructive"
        });
        onClose();
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Assinado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Recusado</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" />
            Assinatura Digital
          </DialogTitle>
          <DialogDescription>
            Documento: <span className="font-semibold text-foreground">{documentTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signers">Signatários</TabsTrigger>
            <TabsTrigger value="history">Histórico Auditável</TabsTrigger>
          </TabsList>

          <TabsContent value="signers" className="py-4 space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome / Cargo</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signatures.length > 0 ? (
                    signatures.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.role}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            {s.confirmationMethod === 'email' ? <Mail className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                            {s.confirmationMethod === 'email' ? 'E-mail' : 'SMS'}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(s.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        Nenhum signatário configurado para este documento.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {canSign && (
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Sua assinatura é necessária
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Ao clicar em assinar, você confirma que leu e concorda com os termos deste documento. Uma confirmação foi enviada para o seu {currentUserSignature.confirmationMethod === 'email' ? 'e-mail' : 'celular'}.
                </p>
                <div className="flex gap-3">
                  <Button className="flex-1 font-bold" onClick={handleSign}>
                    Assinar Agora
                  </Button>
                  <Button variant="outline" className="flex-1 font-bold text-destructive hover:text-destructive" onClick={handleReject}>
                    Recusar
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <History className="h-4 w-4 text-muted-foreground" />
                Trilha de Auditoria
              </div>
              
              <div className="space-y-4">
                {signatures.filter(s => s.status === 'signed').map((s) => (
                  <div key={`history-${s.id}`} className="relative pl-6 pb-4 border-l last:pb-0">
                    <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] rounded-full bg-green-500" />
                    <div className="text-sm">
                      <span className="font-bold">{s.name}</span> assinou o documento
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      <p>Data: {s.signedAt ? format(s.signedAt, "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : '-'}</p>
                      <p>IP: {s.ipAddress}</p>
                      <p>Autenticação: {s.confirmationMethod === 'email' ? 'E-mail' : 'SMS'} verificado</p>
                      <p>Hardware: {s.evidence?.browser} ({s.evidence?.os})</p>
                      <p>Localização: {s.evidence?.location}</p>
                      <p className="font-mono mt-1 text-[9px] bg-muted p-1 rounded truncate">Hash: {s.documentHash}</p>
                    </div>
                  </div>
                ))}
                
                {signatures.filter(s => s.status === 'signed').length === 0 && (
                  <p className="text-sm text-center text-muted-foreground py-8">
                    Nenhuma assinatura registrada ainda.
                  </p>
                )}
              </div>
              
              <Separator />
              <div className="bg-muted/50 p-3 rounded text-[10px] text-muted-foreground">
                Código de Autenticidade: {documentId.substring(0, 8).toUpperCase()}-SIGN-2025
                <br />
                Este documento possui validade jurídica conforme MP 2.200-2/2001.
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
