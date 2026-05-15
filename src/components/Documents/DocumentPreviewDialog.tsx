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
import { Download, FileText, Printer, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Document } from "@/services/DocumentService";

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
