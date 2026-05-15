import { Folder, FileText, Plus, FolderPlus, Upload, ClipboardCheck, LayoutGrid, ShieldCheck, Zap, Grid, CheckCircle2 } from "lucide-react";
import { documentService } from "@/services/DocumentService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export interface FolderItem {
  id: string;
  name: string;
  parentId?: string;
}

export function FolderManager({ onFolderSelect }: { onFolderSelect: (id: string | null) => void }) {
  const { toast } = useToast();
  const folders = documentService.getFolderStructure();

  const getFolderIcon = (iconName: string) => {
    switch(iconName) {
      case 'FileText': return <FileText className="h-4 w-4 mr-2" />;
      case 'ClipboardCheck': return <CheckCircle2 className="h-4 w-4 mr-2" />;
      case 'Layout': return <LayoutGrid className="h-4 w-4 mr-2" />;
      case 'Shield': return <ShieldCheck className="h-4 w-4 mr-2" />;
      case 'Zap': return <Zap className="h-4 w-4 mr-2" />;
      case 'Grid': return <Grid className="h-4 w-4 mr-2" />;
      default: return <Folder className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-muted-foreground uppercase">Pastas</h4>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-xs font-medium" 
          onClick={() => onFolderSelect(null)}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('bg-primary/5');
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('bg-primary/5');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('bg-primary/5');
            const docId = e.dataTransfer.getData('documentId');
            if (docId) {
              documentService.moveDocument(docId, 'root');
              toast({
                title: "Documento Movido",
                description: `O arquivo foi movido para a pasta Raiz.`
              });
              onFolderSelect('root');
            }
          }}
        >
          <Folder className="h-4 w-4 mr-2" /> Raiz
        </Button>
        {folders.filter(f => f.id !== 'root').map(folder => (
          <Button 
            key={folder.id} 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-xs font-medium",
              folder.parentId !== 'root' && "pl-8 text-muted-foreground"
            )}
            onClick={() => onFolderSelect(folder.id)}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('bg-primary/5');
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('bg-primary/5');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('bg-primary/5');
              const docId = e.dataTransfer.getData('documentId');
              if (docId) {
                documentService.moveDocument(docId, folder.id);
                toast({
                  title: "Documento Movido",
                  description: `O arquivo foi movido para a pasta ${folder.name}.`
                });
                onFolderSelect(folder.id);
              }
            }}
          >
            {getFolderIcon(folder.icon)} {folder.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
