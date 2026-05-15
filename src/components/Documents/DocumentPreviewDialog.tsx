import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Pré-visualização: {document.title}
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
        
        <div className="flex-1 overflow-hidden border rounded-md bg-white p-8 shadow-inner">
          <ScrollArea className="h-full pr-4">
            <div 
              className="max-w-2xl mx-auto prose prose-sm transition-all duration-300"
              style={{ 
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'top center'
              }}
            >
              {document.type === "auto" ? (
                <pre className="whitespace-pre-wrap font-serif text-base text-gray-800 bg-transparent p-0 border-none shadow-none">
                  {generatedContent || document.template}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <FileText size={64} className="mb-4 opacity-20" />
                  <p>Este é um documento manual (PDF/Imagem).</p>
                  <p className="text-xs">O preview integrado está disponível apenas para templates dinâmicos.</p>
                  <Button variant="link" className="mt-4">Clique aqui para abrir em nova aba</Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
