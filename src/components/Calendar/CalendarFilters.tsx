
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface CalendarFiltersProps {
  filterType: string;
  setFilterType: (value: string) => void;
  filterProperty: string;
  setFilterProperty: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  filterSheetOpen: boolean;
  setFilterSheetOpen: (open: boolean) => void;
}

export function CalendarFilters({
  filterType,
  setFilterType,
  filterProperty,
  setFilterProperty,
  filterStatus,
  setFilterStatus,
  dateFilter,
  setDateFilter,
  searchQuery,
  setSearchQuery,
  filterSheetOpen,
  setFilterSheetOpen
}: CalendarFiltersProps) {
  const clearFilters = () => {
    setFilterProperty("all-properties");
    if (setSearchQuery) setSearchQuery("");
    setDateFilter("all");
    setFilterSheetOpen(false);
    setFilterType("all");
    setFilterStatus("all");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Tipo</label>
        <Select 
          defaultValue={filterType}
          value={filterType}
          onValueChange={setFilterType}
        >
          <SelectTrigger className="h-11 rounded-xl bg-card/50">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="inspection">Vistorias</SelectItem>
            <SelectItem value="warranty">Garantias</SelectItem>
            <SelectItem value="delivery">Entregas</SelectItem>
            <SelectItem value="technical_visit">Visitas Técnicas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Empreendimento</label>
        <Select 
          defaultValue={filterProperty}
          value={filterProperty}
          onValueChange={setFilterProperty}
        >
          <SelectTrigger className="h-11 rounded-xl bg-card/50">
            <SelectValue placeholder="Empreendimento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-properties">Todos</SelectItem>
            <SelectItem value="aurora">Edifício Aurora</SelectItem>
            <SelectItem value="bosque">Residencial Bosque Verde</SelectItem>
            <SelectItem value="monte">Condomínio Monte Azul</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Status</label>
        <Select 
          defaultValue={filterStatus}
          value={filterStatus}
          onValueChange={setFilterStatus}
        >
          <SelectTrigger className="h-11 rounded-xl bg-card/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
            <SelectItem value="rescheduled">Reagendado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {searchQuery !== undefined && setSearchQuery && (
        <div className="relative sm:col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar agendamentos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}
      
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="sm:col-span-1">
            <Filter className="mr-2 h-4 w-4" />
            Filtros avançados
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
                value={filterProperty} 
                onValueChange={setFilterProperty}
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
}
