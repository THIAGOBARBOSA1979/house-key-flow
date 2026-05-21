
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface WarrantyFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProperty: string;
  setSelectedProperty: (property: string) => void;
  filterSheetOpen: boolean;
  setFilterSheetOpen: (open: boolean) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  clearFilters: () => void;
}

export const WarrantyFilters = ({
  searchQuery,
  setSearchQuery,
  selectedProperty,
  setSelectedProperty,
  filterSheetOpen,
  setFilterSheetOpen,
  dateFilter,
  setDateFilter,
  clearFilters
}: WarrantyFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar solicitações..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Select 
        value={selectedProperty} 
        onValueChange={setSelectedProperty}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Empreendimento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-properties">Todos</SelectItem>
          <SelectItem value="aurora">Edifício Aurora</SelectItem>
          <SelectItem value="bosque">Residencial Bosque Verde</SelectItem>
          <SelectItem value="monte">Condomínio Monte Azul</SelectItem>
        </SelectContent>
      </Select>
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full md:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Período</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={dateFilter === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setDateFilter("all")}
                >
                  Todos
                </Button>
                <Button 
                  variant={dateFilter === "today" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setDateFilter("today")}
                >
                  Hoje
                </Button>
                <Button 
                  variant={dateFilter === "week" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setDateFilter("week")}
                >
                  Última semana
                </Button>
                <Button 
                  variant={dateFilter === "month" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setDateFilter("month")}
                >
                  Último mês
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Empreendimento</h3>
              <Select 
                value={selectedProperty} 
                onValueChange={setSelectedProperty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-properties">Todos</SelectItem>
                  <SelectItem value="aurora">Edifício Aurora</SelectItem>
                  <SelectItem value="bosque">Residencial Bosque Verde</SelectItem>
                  <SelectItem value="monte">Condomínio Monte Azul</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={clearFilters}>
                Limpar filtros
              </Button>
              <Button onClick={() => setFilterSheetOpen(false)}>
                Aplicar filtros
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
