
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChecklistItem, ChecklistTemplate, checklistService } from "@/services/ChecklistService";
import { Plus, FileText, Copy, Edit, Trash, Search, Star, LayoutGrid, List, Archive, Download, Settings, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { exportService } from "@/services/ExportService";


interface ChecklistTemplatesProps {
  onSelectTemplate: (template: ChecklistTemplate) => void;
  onCreateNew: () => void;
}

export function ChecklistTemplates({ onSelectTemplate, onCreateNew }: ChecklistTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const templates = checklistService.getAllTemplates();
  const categories = ["all", "vistoria", "garantia", "manutencao", "hidraulica", "eletrica", "entrega"];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleDuplicateTemplate = (template: ChecklistTemplate) => {
    const { id, createdAt, lastUpdated, version, ...rest } = template;
    checklistService.createTemplate({
      ...rest,
      title: `${template.title} (Cópia)`,
    });
  };

  const handleArchiveTemplate = async (id: string) => {
    await checklistService.archiveTemplate(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-slow">
      {/* Header com busca e filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 bg-muted/30 p-1 rounded-lg">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="h-8 w-8"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === "all" ? "Todos" : category}
            </Button>
          ))}
        </div>

        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      {/* Grid ou List de templates */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {template.title}
                      {template.id.startsWith("checklist") && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Itens:</span>
                    <Badge variant="secondary">{template.groups?.reduce((acc, g) => acc + g.items.length, 0) || 0}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Categoria:</span>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Criado:</span>
                    <span>{template.createdAt.toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onSelectTemplate(template)}
                    >
                      Usar Template
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveTemplate(template.id);
                      }}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden border-none shadow-sm">
          <div className="divide-y divide-border/50">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold flex items-center gap-2">
                      {template.title}
                      {template.id.startsWith("checklist") && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex gap-2">
                    <Badge variant="secondary" className="text-[10px]">{template.groups?.reduce((acc, g) => acc + g.items.length, 0) || 0} Itens</Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">{template.category}</Badge>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => onSelectTemplate(template)}>Usar</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDuplicateTemplate(template)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    {!template.id.startsWith("checklist") && (
                      <Button size="sm" variant="ghost" onClick={() => handleArchiveTemplate(template.id)} className="text-destructive">
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum template encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou criar um novo template
            </p>
            <Button className="mt-4" onClick={onCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
