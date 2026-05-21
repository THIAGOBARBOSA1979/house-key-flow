
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChecklistItem, ChecklistTemplate, checklistService } from "@/services";
import { Plus, FileText, Copy, Edit, Trash, Search, Star, LayoutGrid, List, Archive, Download, Settings, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks";
import { exportService } from "@/services";


interface ChecklistTemplatesProps {
  onSelectTemplate: (template: ChecklistTemplate) => void;
  onCreateNew: () => void;
}

export function ChecklistTemplates({ onSelectTemplate, onCreateNew }: ChecklistTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);

  useEffect(() => {
    checklistService.getAllTemplates().then(setTemplates);
  }, []);
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

  const handleBulkArchive = async () => {
    for (const id of selectedIds) {
      await checklistService.archiveTemplate(id);
    }
    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    const selectedTemplates = templates.filter(t => selectedIds.includes(t.id));
    exportService.exportToCSV(selectedTemplates, "checklists_selecionados");
    setSelectedIds([]);
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-slow">
      {/* Header com busca e filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar diretrizes..."
            className="pl-8 h-11 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 bg-muted/30 p-1 rounded-xl">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="h-9 w-9 rounded-lg"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="h-9 w-9 rounded-lg"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize rounded-xl h-11 px-4 font-bold"
            >
              {category === "all" ? "Todos" : category}
            </Button>
          ))}
        </div>

        <Button onClick={onCreateNew} className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Nova Matriz Técnica
        </Button>
      </div>

      {selectedIds.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20 animate-in zoom-in-95 duration-200 rounded-2xl border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-white p-2 rounded-xl">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <p className="text-sm font-black text-primary uppercase tracking-widest leading-none">Ações de Governança</p>
              <p className="text-xs text-muted-foreground font-bold">{selectedIds.length} diretrizes selecionadas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 font-bold" onClick={() => setSelectedIds([])}>
               Cancelar
             </Button>
             <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 font-bold gap-2" onClick={handleBulkExport}>
               <Download className="w-4 h-4" /> Exportar CSV
             </Button>
             <Button variant="destructive" size="sm" className="rounded-xl h-10 px-4 font-bold gap-2" onClick={handleBulkArchive}>
               <Archive className="w-4 h-4" /> Arquivar selecionados
             </Button>
          </div>
        </Card>
      )}

      {/* Grid ou List de templates */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className={cn(
              "hover:shadow-sem-lg transition-all cursor-pointer relative border-none bg-card/40 backdrop-blur-md rounded-3xl group overflow-hidden",
              selectedIds.includes(template.id) && "ring-2 ring-primary"
            )} onClick={() => onSelectTemplate(template)}>
              <div className="absolute top-4 left-4 z-10" onClick={(e) => e.stopPropagation()}>
                <Checkbox 
                  checked={selectedIds.includes(template.id)}
                  onCheckedChange={() => handleSelect(template.id)}
                  className="rounded-md"
                />
              </div>
              <CardHeader className="pl-14">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 font-black tracking-tight text-xl">
                      <FileText className="h-5 w-5 text-primary" />
                      {template.title}
                      {template.id.startsWith("checklist") && (
                        <Star className="h-4 w-4 text-amber-500 fill-current" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-medium line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground/60">Itens Técnicos</span>
                    <Badge variant="secondary" className="rounded-lg bg-primary/5 text-primary border-primary/10">{template.groups?.reduce((acc, g) => acc + g.items.length, 0) || 0}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground/60">Categoria</span>
                    <Badge variant="outline" className="rounded-lg border-primary/20">{template.category}</Badge>
                  </div>
                  
                  <div className="pt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest h-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate(template);
                      }}
                    >
                      Habilitar Checklist
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="rounded-xl h-10 px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateTemplate(template);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-xl h-10 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" 
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
        <Card className="overflow-hidden border-none shadow-sem-sm rounded-3xl bg-card/40 backdrop-blur-md">
          <div className="divide-y divide-border/10">
            {filteredTemplates.map((template) => (
              <div key={template.id} className={cn(
                "p-5 flex items-center justify-between hover:bg-primary/5 transition-all cursor-pointer group",
                selectedIds.includes(template.id) && "bg-primary/5"
              )} onClick={() => onSelectTemplate(template)}>
                <div className="flex items-center gap-4">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedIds.includes(template.id)}
                      onCheckedChange={() => handleSelect(template.id)}
                      className="rounded-md"
                    />
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-black flex items-center gap-2 text-lg tracking-tight">
                      {template.title}
                      {template.id.startsWith("checklist") && <Star className="h-3 w-3 text-amber-500 fill-current" />}
                    </h4>
                    <p className="text-xs text-muted-foreground font-medium line-clamp-1">{template.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex gap-3">
                    <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary rounded-lg border-none">{template.groups?.reduce((acc, g) => acc + g.items.length, 0) || 0} Itens</Badge>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest rounded-lg">{template.category}</Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-xl h-9 px-4 font-bold" onClick={(e) => { e.stopPropagation(); onSelectTemplate(template); }}>Habilitar</Button>
                    <Button size="sm" variant="ghost" className="rounded-xl h-9 w-9 p-0" onClick={(e) => { e.stopPropagation(); handleDuplicateTemplate(template); }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    {!template.id.startsWith("checklist") && (
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleArchiveTemplate(template.id); }} className="text-destructive rounded-xl h-9 w-9 p-0 hover:bg-destructive/10">
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
        <Card className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-lg overflow-hidden">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Nenhum template encontrado</h3>
            <p className="text-muted-foreground font-medium mt-2 max-w-sm mx-auto">
              Tente ajustar os filtros de busca ou crie um novo modelo para padronizar suas vistorias.
            </p>
            <Button className="mt-8 rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20" onClick={onCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
