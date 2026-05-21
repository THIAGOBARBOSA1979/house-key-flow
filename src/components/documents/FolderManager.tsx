import { Folder, FileText, Plus, FolderPlus, Upload, ClipboardCheck, LayoutGrid, ShieldCheck, Zap, Grid, CheckCircle2 } from "lucide-react";
import { documentService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks";

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
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Pastas</h4>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-1 bg-muted/20 p-2 rounded-xl border border-border/50 shadow-sem-sm">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-xs font-bold h-9 px-3 hover:bg-primary/5 hover:text-primary rounded-lg transition-all" 
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
              "w-full justify-start text-xs font-bold h-9 px-3 hover:bg-primary/5 hover:text-primary rounded-lg transition-all",
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
