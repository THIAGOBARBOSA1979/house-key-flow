
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DocumentVersion, Document } from "@/services/DocumentService";
import { History, Download, Eye, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentVersionHistoryProps {
  document: Document;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRestoreVersion?: (versionId: string) => void;
}

export function DocumentVersionHistory({ document, onRestoreVersion, isOpen: externalOpen, onOpenChange }: DocumentVersionHistoryProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<DocumentVersion | null>(null);

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const versions = document.versionHistory || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            Histórico ({versions.length + 1})
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6">
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Histórico de Versões
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-medium">{document.title}</p>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-0 border-t border-b">
          <div className="lg:col-span-1 border-r bg-muted/5 flex flex-col">
            <div className="p-4 border-b bg-muted/10">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Versões Disponíveis</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                <Card className={cn(
                  "border-primary/20 transition-all cursor-pointer hover:border-primary/50",
                  !previewVersion ? "bg-primary/5 shadow-sem-sm ring-1 ring-primary/20" : "bg-background"
                )} onClick={() => setPreviewVersion(null)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary text-primary-foreground">v{document.version} (Atual)</Badge>
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {document.updatedAt.toLocaleDateString()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <User className="h-3 w-3 inline mr-1" />
                          {document.createdBy}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => setPreviewVersion(null)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {versions.map((version) => (
                  <Card 
                    key={version.id} 
                    className={cn(
                      "transition-all cursor-pointer hover:border-primary/50",
                      previewVersion?.id === version.id ? "bg-primary/5 shadow-sem-sm ring-1 ring-primary/20 border-primary/20" : "bg-background"
                    )}
                    onClick={() => setPreviewVersion(version)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">v{version.version}</Badge>
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              {version.createdAt.toLocaleDateString()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            <User className="h-3 w-3 inline mr-1" />
                            {version.createdBy}
                          </p>
                          <p className="text-xs text-muted-foreground">{version.changes}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => setPreviewVersion(version)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {onRestoreVersion && (
                            <Button size="sm" variant="outline" onClick={() => onRestoreVersion(version.id)}>
                              Restaurar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="lg:col-span-2 flex flex-col bg-background">
            <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Conteúdo da Versão</h3>
              {previewVersion && (
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  Visualizando v{previewVersion.version}
                </Badge>
              )}
            </div>
            <div className="flex-1 overflow-hidden p-6">
              <div className="h-full rounded-xl border border-border/50 bg-muted/5 p-6 overflow-hidden">
                <ScrollArea className="h-full">
                  <pre className="whitespace-pre-wrap text-sm font-serif leading-relaxed text-foreground/90">
                    {previewVersion ? previewVersion.template : document.template}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 flex justify-end bg-muted/5">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="font-bold">Fechar Histórico</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
