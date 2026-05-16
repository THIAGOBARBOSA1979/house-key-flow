import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText, Printer, ZoomIn, ZoomOut, RotateCw, ShieldCheck, History } from "lucide-react";
import { Document, documentService } from "@/services/DocumentService";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DocumentPreviewDialogProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  generatedContent?: string;
}

export function DocumentPreviewDialog({ document, isOpen, onClose, generatedContent }: DocumentPreviewDialogProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex flex-row items-center justify-between p-6">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="truncate max-w-[200px] sm:max-w-md">{document.title}</span>
          </DialogTitle>
          <div className="flex gap-2 mr-6">
            <div className="flex items-center gap-1 mr-4 border-r pr-4">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs font-bold w-12 text-center">{zoom}%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 ml-2" onClick={() => setRotation((rotation + 90) % 360)}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" /> Imprimir
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" /> Baixar PDF
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden bg-muted/10 p-4 sm:p-8">
          <div className="h-full bg-white rounded-xl shadow-sem-lg border border-border/50 overflow-hidden flex flex-col">
            <ScrollArea className="h-full">
              <div className="p-8 sm:p-12 min-h-full flex flex-col items-center">
                <div 
                  className="w-full max-w-3xl prose prose-sm transition-all duration-300 origin-top"
                  style={{ 
                    transform: `scale(${zoom / 100})`,
                    marginBottom: `${(zoom / 100) * 20}px`
                  }}
                >
                  <div style={{ transform: `rotate(${rotation}deg)` }}>
                    {document.type === "auto" ? (
                      <pre className="whitespace-pre-wrap font-serif text-base text-gray-800 bg-transparent p-0 border-none shadow-none leading-relaxed">
                        {generatedContent || document.template}
                      </pre>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                        <div className="p-6 rounded-full bg-muted/30 mb-6">
                          <FileText size={64} className="opacity-20" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Documento Manual</h3>
                        <p className="max-w-xs mx-auto">Este arquivo (PDF/Imagem) foi enviado manualmente e não possui visualização dinâmica.</p>
                        <Button variant="outline" className="mt-6 font-bold">
                          <Download className="w-4 h-4 mr-2" /> Baixar para Visualizar
                        </Button>
                      </div>
                    )}
                  </div>
                  </div>

                  {document.signatures && document.signatures.some(s => s.status === 'signed') && (
                    <div className="mt-20 pt-8 border-t-2 border-dashed border-gray-200 w-full max-w-3xl">
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Assinaturas Digitais Identificadas
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {document.signatures.filter(s => s.status === 'signed').map(sig => (
                          <div key={sig.id} className="space-y-2 p-4 bg-muted/5 rounded-xl border border-muted-foreground/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5">
                              <ShieldCheck size={48} />
                            </div>
                            <div className="font-serif italic text-lg text-gray-700">{sig.name}</div>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground border-t pt-2">
                              {sig.role} • Assinado em {sig.signedAt ? format(sig.signedAt, "dd/MM/yyyy HH:mm", { locale: ptBR }) : ''}
                            </div>
                            <div className="text-[8px] font-mono text-muted-foreground/60 break-all leading-tight">
                              ID: {sig.id.substring(0,8)} | Hash: {sig.documentHash?.substring(0, 16)}...
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-12 p-4 bg-primary/5 rounded-lg border border-primary/20 text-[9px] text-muted-foreground flex items-start gap-3">
                        <History className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-bold text-primary uppercase tracking-widest mb-1">Certificado de Autenticidade</p>
                          <p>Este documento foi assinado digitalmente através da plataforma A2 Engenharia. As assinaturas possuem validade jurídica conforme Medida Provisória nº 2.200-2/2001. A integridade do documento é garantida por hashes criptográficos individuais.</p>
                          <p className="mt-1">Código de Verificação: {document.id.toUpperCase()}-SIGN-2025</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="font-bold">Fechar</Button>
          <div className="flex-1" />
          <Button variant="outline" className="font-bold hidden sm:flex">
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
          <Button className="font-bold">
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
