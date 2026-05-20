
import { Filter, Building } from "lucide-react";
import { FilterBar } from "@/components/Layout/FilterBar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface InspectionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    status: string;
    property: string;
    [key: string]: any;
  };

  onFilterChange: (key: string, value: string) => void;
  properties?: string[];
}

export const InspectionFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFilterChange,
  properties = ["Edifício Aurora", "Residencial Bosque Verde", "Condomínio Monte Azul"]
}: InspectionFiltersProps) => {
  return (
    <FilterBar 
      searchPlaceholder="Buscar por empreendimento, cliente ou unidade..." 
      searchValue={searchTerm} 
      onSearchChange={onSearchChange}
    >
      <div className="flex flex-wrap gap-2 w-full lg:w-auto">
        <Select 
          value={filters.status} 
          onValueChange={(val) => onFilterChange("status", val)}
        >
          <SelectTrigger className="w-full sm:w-[160px] rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="progress">Em andamento</SelectItem>
            <SelectItem value="complete">Concluídos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.property} 
          onValueChange={(val) => onFilterChange("property", val)}
        >
          <SelectTrigger className="w-full sm:w-[180px] rounded-lg">
            <div className="flex items-center gap-2">
              <Building className="h-3 w-3 text-muted-foreground" />
              <SelectValue placeholder="Empreendimento" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os imóveis</SelectItem>
            {properties.map(prop => (
              <SelectItem key={prop} value={prop}>{prop}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </FilterBar>
  );
};
