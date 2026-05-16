
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (isOpen && documentId) {
      setSignatures(documentService.getSignatureHistory(documentId));
    }
  }, [isOpen, documentId]);

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
        return <Badge className="bg-green-500 font-black text-[9px] uppercase tracking-widest"><CheckCircle className="w-3 h-3 mr-1" /> Assinado</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="font-black text-[9px] uppercase tracking-widest">Recusado</Badge>;
      default:
        return <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-widest"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
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
            <div className="border rounded-2xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[50px] text-center">#</TableHead>
                    <TableHead>Signatário / Cargo</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signatures.length > 0 ? (
                    signatures.map((s, idx) => (
                      <TableRow key={s.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="text-center">
                          <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center rounded-full font-black text-[10px]">
                            {s.order || idx + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-sm">{s.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{s.role}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase">
                            {s.confirmationMethod === 'email' ? <Mail className="w-3.5 h-3.5 text-primary/60" /> : <Smartphone className="w-3.5 h-3.5 text-primary/60" />}
                            {s.confirmationMethod}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(s.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic text-sm">
                        Nenhum signatário configurado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {canSign && (
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 shadow-sm animate-in zoom-in-95 duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg flex items-center gap-2">
                      Sua assinatura é necessária
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ao clicar em assinar, você confirma que leu e concorda com os termos deste documento, registrando sua digital com validade jurídica.
                    </p>
                  </div>
                </div>
                
                <div className="bg-background/50 p-3 rounded-xl border border-border/50 mb-6 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Autenticação:</span>
                    <span className="font-bold flex items-center gap-1">
                      {currentUserSignature.confirmationMethod === 'email' ? <Mail size={12}/> : <Smartphone size={12}/>}
                      {currentUserSignature.confirmationMethod === 'email' ? 'E-mail Verificado' : 'SMS Token'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posição no Fluxo:</span>
                    <span className="font-bold">#{currentUserSignature.order || 1}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 h-12 font-black uppercase tracking-widest text-xs shadow-lg hover:translate-y-[-2px] transition-all" onClick={handleSign}>
                    Confirmar Assinatura
                  </Button>
                  <Button variant="outline" className="flex-1 h-12 font-black uppercase tracking-widest text-xs border-2 text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30" onClick={handleReject}>
                    Recusar
                  </Button>
                </div>
              </div>
            )}

            {!canSign && currentUserSignature && currentUserSignature.status === 'signed' && (
              <div className="bg-green-500/5 p-6 rounded-2xl border border-green-500/20 text-center space-y-3">
                <div className="inline-flex p-3 bg-green-500/10 rounded-full text-green-600 mb-2">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h4 className="font-black text-green-700">Você já assinou este documento</h4>
                <p className="text-xs text-green-600/80 max-w-xs mx-auto">
                  Sua assinatura foi registrada em {currentUserSignature.signedAt ? format(currentUserSignature.signedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : ''}.
                </p>
              </div>
            )}

            {!currentUserSignature && (
              <div className="p-8 text-center bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/10">
                <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">Você não está listado como signatário deste documento.</p>
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
