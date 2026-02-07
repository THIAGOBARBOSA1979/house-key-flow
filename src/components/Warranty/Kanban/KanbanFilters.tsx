
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WarrantyFilters, SLAStatus } from "@/types/warrantyFlow";
import { Search, X, Filter, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface KanbanFiltersProps {
  filters: WarrantyFilters;
  onFiltersChange: (filters: WarrantyFilters) => void;
  categories: string[];
  properties: { id: string; name: string }[];
  technicians: { id: string; name: string }[];
}

export function KanbanFilters({
  filters,
  onFiltersChange,
  categories,
  properties,
  technicians
}: KanbanFiltersProps) {
  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== "").length;

  const clearFilters = () => {
    onFiltersChange({});
  };

  const updateFilter = (key: keyof WarrantyFilters, value: string | undefined) => {
    if (value === "" || value === "all") {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFiltersChange(newFilters);
    } else {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar solicitações..."
          value={filters.search || ""}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-9"
        />
      </div>
      
      {/* Quick filters */}
      <Select
        value={filters.slaStatus || "all"}
        onValueChange={(value) => updateFilter("slaStatus", value as SLAStatus)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status SLA" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="on_track">No prazo</SelectItem>
          <SelectItem value="warning">Em alerta</SelectItem>
          <SelectItem value="expired">Atrasados</SelectItem>
        </SelectContent>
      </Select>
      
      <Select
        value={filters.priority || "all"}
        onValueChange={(value) => updateFilter("priority", value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="critical">Crítica</SelectItem>
          <SelectItem value="high">Alta</SelectItem>
          <SelectItem value="medium">Média</SelectItem>
          <SelectItem value="low">Baixa</SelectItem>
        </SelectContent>
      </Select>
      
      {/* More filters sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Mais filtros
            {activeFiltersCount > 2 && (
              <Badge variant="secondary" className="ml-1">
                +{activeFiltersCount - 2}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filtros Avançados</SheetTitle>
            <SheetDescription>
              Refine a visualização do Kanban
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-4 mt-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select
                value={filters.category || "all"}
                onValueChange={(value) => updateFilter("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Empreendimento</label>
              <Select
                value={filters.propertyId || "all"}
                onValueChange={(value) => updateFilter("propertyId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os imóveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {properties.map(prop => (
                    <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Responsável</label>
              <Select
                value={filters.assignedTo || "all"}
                onValueChange={(value) => updateFilter("assignedTo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {technicians.map(tech => (
                    <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Clear filters */}
      {activeFiltersCount > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="gap-1 text-muted-foreground"
        >
          <X className="h-4 w-4" />
          Limpar ({activeFiltersCount})
        </Button>
      )}
    </div>
  );
}
