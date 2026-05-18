import { FilterX, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterBar } from "@/components/Layout/FilterBar";
import { Property } from "@/types/property";

interface PropertyFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  managerFilter: string;
  onManagerChange: (value: string) => void;
  managers: string[];
  onClearFilters: () => void;
  children?: React.ReactNode;
}

export const PropertyFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  managerFilter,
  onManagerChange,
  managers,
  onClearFilters,
  children
}: PropertyFiltersProps) => {
  const hasActiveFilters = searchTerm || statusFilter !== "all" || managerFilter !== "all";

  return (
    <FilterBar searchPlaceholder="Buscar..." searchValue={searchTerm} onSearchChange={onSearchChange}>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[170px] rounded-xl h-11 bg-background shadow-sem-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none shadow-sem-xl animate-in zoom-in-95">
            <SelectItem value="all" className="rounded-lg font-medium">Todos os status</SelectItem>
            <SelectItem value="pending" className="rounded-lg font-medium">⏳ Pendentes</SelectItem>
            <SelectItem value="progress" className="rounded-lg font-medium">🏗️ Em andamento</SelectItem>
            <SelectItem value="complete" className="rounded-lg font-medium">✅ Concluídos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={managerFilter} onValueChange={onManagerChange}>
          <SelectTrigger className="w-full sm:w-[170px] rounded-xl h-11 bg-background shadow-sem-sm">
            <SelectValue placeholder="Gerente" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none shadow-sem-xl animate-in zoom-in-95">
            <SelectItem value="all" className="rounded-lg font-medium">Todos Gerentes</SelectItem>
            {managers.map(manager => (
              <SelectItem key={manager} value={manager} className="rounded-lg font-medium">{manager}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters} 
            className="text-muted-foreground hover:text-foreground h-11 rounded-xl px-4 font-bold uppercase text-[10px] tracking-widest"
          >
            <FilterX className="h-4 w-4 mr-2" /> Limpar Filtros
          </Button>
        )}

        <div className="h-8 w-px bg-border/40 mx-2 hidden lg:block" />
        
        {children}
      </div>
    </FilterBar>
  );
};
