
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DocumentVersion, Document } from "@/services/DocumentService";
import { History, Download, Eye, Clock, User } from "lucide-react";

interface DocumentVersionHistoryProps {
  document: Document;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRestoreVersion?: (versionId: string) => void;
}

export function DocumentVersionHistory({ document, onRestoreVersion }: DocumentVersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<DocumentVersion | null>(null);

  const versions = document.versionHistory || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4 mr-2" />
          Histórico ({versions.length + 1})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Histórico de Versões - {document.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[60vh]">
          <div className="space-y-4">
            <h3 className="font-medium">Versões</h3>
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {/* Current version */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">v{document.version} (Atual)</Badge>
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

                {/* Previous versions */}
                {versions.map((version) => (
                  <Card key={version.id}>
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

          <div className="space-y-4">
            <h3 className="font-medium">Preview</h3>
            <Card className="h-full">
              <CardContent className="p-4 h-full">
                <ScrollArea className="h-full">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {previewVersion ? previewVersion.template : document.template}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
