import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Search, Filter, X, Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { documentService } from "@/services";
import { cn } from "@/lib/utils";

interface DocumentFiltersProps {
  onSearch: (query: string, filters: any) => void;
  activeFilters: any;
  onClearFilters: () => void;
}

export function DocumentFilters({ onSearch, activeFilters, onClearFilters }: DocumentFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(activeFilters.dateRange || {});
  
  const categories = documentService.getCategories();

  const handleSearch = (updatedFilters?: any) => {
    const filters = updatedFilters || {
      category: activeFilters.category,
      status: activeFilters.status,
      priority: activeFilters.priority,
      dateRange: dateRange.from && dateRange.to ? dateRange : undefined
    };
    onSearch(searchQuery, filters);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    handleSearch(newFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(Boolean).length + 
           (dateRange.from && dateRange.to ? 1 : 0);
  };

  return (
    <div className="space-y-4">
      {/* Busca principal */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            className="pl-10 h-11 bg-background/50"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value === "") {
                onSearch("", activeFilters);
              }
            }}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} className="h-11 px-6 font-bold shadow-sem-sm">Buscar</Button>
        <Button 
          variant="outline" 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "relative h-11 px-6 font-bold transition-all",
            showAdvanced && "bg-muted ring-1 ring-border shadow-inner"
          )}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {getActiveFilterCount() > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px] font-black shadow-lg">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filtros avançados */}
      {showAdvanced && (
        <Card className="border-none shadow-sem-md bg-muted/20 animate-in slide-in-from-top-2 duration-300">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select 
                  value={activeFilters.category || ""} 
                  onValueChange={(value) => handleFilterChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={activeFilters.status || ""} 
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prioridade</label>
                <Select 
                  value={activeFilters.priority || ""} 
                  onValueChange={(value) => handleFilterChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-11 bg-background">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                        ) : (
                          dateRange.from.toLocaleDateString()
                        )
                      ) : (
                        "Selecionar período"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => {
                        setDateRange(range || {});
                        if (range?.from && range?.to) {
                          handleFilterChange("dateRange", range);
                        }
                      }}
                      numberOfMonths={2}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2 flex-wrap">
                {Object.entries(activeFilters).map(([key, value]) => 
                  value && (
                    <Badge key={key} variant="secondary" className="gap-1">
                      {key}: {String(value)}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange(key, "")}
                      />
                    </Badge>
                  )
                )}
                {dateRange.from && dateRange.to && (
                  <Badge variant="secondary" className="gap-1">
                    Período selecionado
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange("dateRange", undefined)}
                    />
                  </Badge>
                )}
              </div>
              
              {getActiveFilterCount() > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    onClearFilters();
                    setDateRange({});
                    setSearchQuery("");
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
