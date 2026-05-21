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
import { Download, FileText, Printer, ZoomIn, ZoomOut, RotateCw, ShieldCheck, History, Clock, AlertTriangle } from "lucide-react";
import { Document, documentService } from "@/services";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <div className="h-full bg-white rounded-xl shadow-sem-lg border border-border/50 overflow-hidden flex flex-col relative">
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  <p className="text-sm font-bold text-primary animate-pulse">Otimizando visualização técnica...</p>
                </div>
              </div>
            )}

            {error ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                <h3 className="text-lg font-bold mb-2">Erro ao carregar documento</h3>
                <p className="text-muted-foreground max-w-md mb-6">{error}</p>
                <Button onClick={onClose} variant="outline">Fechar Visualizador</Button>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-8 sm:p-12 min-h-full flex flex-col items-center">
                  <div 
                    className="w-full max-w-4xl prose prose-sm transition-all duration-300 origin-top"
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
                      ) : document.fileUrl ? (
                        <div className="space-y-6">
                          {/* Modern PDF/Image viewer for technical docs */}
                          {document.fileUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                            <div className="rounded-lg overflow-hidden border shadow-sm bg-slate-50">
                              <img 
                                src={document.fileUrl} 
                                alt={document.title} 
                                className="w-full h-auto object-contain"
                                onLoad={() => setIsLoading(false)}
                                onError={() => {
                                  setError("Não foi possível carregar a imagem técnica.");
                                  setIsLoading(false);
                                }}
                              />
                            </div>
                          ) : (
                            <div className="aspect-[1/1.4] w-full rounded-lg overflow-hidden border shadow-sm bg-slate-50">
                              <iframe 
                                src={`${document.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full border-none"
                                onLoad={() => setIsLoading(false)}
                                title={document.title}
                              />
                            </div>
                          )}
                          
                          {document.technical_metadata && (
                            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                              <h5 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Especificações Técnicas do Arquivo
                              </h5>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Dimensões</p>
                                  <p className="text-sm font-bold">{(document as any).technical_metadata?.dimensions || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Resolução</p>
                                  <p className="text-sm font-bold">{(document as any).technical_metadata?.resolution || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Escala</p>
                                  <p className="text-sm font-bold">{(document as any).technical_metadata?.scale || 'Original'}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Camadas</p>
                                  <p className="text-sm font-bold">{(document as any).technical_metadata?.layers ? 'Habilitadas' : 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
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
                    <div className="mt-20 pt-10 border-t-2 border-dashed border-gray-200 w-full max-w-3xl">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-primary" /> Trilhas de Assinatura Digital
                        </h4>
                        <Badge variant="outline" className="text-[10px] font-black bg-primary/5 text-primary border-primary/20">VALIDADO</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {document.signatures.filter(s => s.status === 'signed').map(sig => (
                          <div key={sig.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 relative overflow-hidden group hover:border-primary/30 transition-all">
                            <div className="absolute top-[-10px] right-[-10px] p-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                              <ShieldCheck size={80} />
                            </div>
                            <div className="font-serif italic text-xl text-slate-800 mb-1">{sig.name}</div>
                            <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-200 pb-2 mb-3">
                              {sig.role}
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold">
                                <Clock size={12} className="text-slate-400" />
                                ASSINADO EM {sig.signedAt ? format(sig.signedAt, "dd/MM/yyyy HH:mm", { locale: ptBR }) : ''}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold">
                                <ShieldCheck size={12} className="text-slate-400" />
                                IP: {sig.ipAddress}
                              </div>
                              <div className="mt-3 font-mono text-[9px] text-slate-400 bg-white p-2 rounded border border-slate-100 break-all leading-tight">
                                HASH: {sig.documentHash}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-12 p-6 bg-slate-900 rounded-2xl text-[10px] text-slate-400 flex items-start gap-4 shadow-xl">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <History className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-black text-white uppercase tracking-[0.2em] mb-2 text-xs">Certificado de Autenticidade Digital</p>
                          <p className="leading-relaxed opacity-80">Este documento eletrônico é assinado digitalmente nos termos da MP nº 2.200-2/2001, que instituiu a ICP-Brasil. A integridade e a autoria deste documento são garantidas por criptografia de chave pública e hashes individuais por signatário.</p>
                          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-4">
                            <span className="font-bold">Protocolo: <span className="text-primary font-mono">{document.id.toUpperCase().substring(0,12)}</span></span>
                            <span className="font-bold">Emissão: <span className="text-white">{format(document.createdAt, "dd/MM/yyyy HH:mm")}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
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
