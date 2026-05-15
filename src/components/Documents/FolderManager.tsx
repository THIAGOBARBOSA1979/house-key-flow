import { Folder, FileText, Plus, FolderPlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface FolderItem {
  id: string;
  name: string;
  parentId?: string;
}

export function FolderManager({ onFolderSelect }: { onFolderSelect: (id: string | null) => void }) {
  const folders: FolderItem[] = [
    { id: "f1", name: "Contratos" },
    { id: "f2", name: "Vistorias 2025" },
    { id: "f3", name: "Alvarás" },
    { id: "f4", name: "Projetos Estruturais" },
    { id: "f5", name: "Licenças Ambientais" },
  ];

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
        >
          <Folder className="h-4 w-4 mr-2" /> Raiz
        </Button>
        {folders.map(folder => (
          <Button 
            key={folder.id} 
            variant="ghost" 
            className="w-full justify-start text-xs font-medium"
            onClick={() => onFolderSelect(folder.id)}
          >
            <Folder className="h-4 w-4 mr-2" /> {folder.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
