
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building, Plus } from "lucide-react";
import { PropertyCard } from "@/components/Properties/PropertyCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { FilterBar } from "@/components/Layout/FilterBar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Mock data
const properties = [
  {
    id: "1",
    name: "Edifício Aurora",
    location: "São Paulo, SP",
    units: 120,
    completedUnits: 85,
    status: "progress" as const,
  },
  {
    id: "2",
    name: "Residencial Bosque Verde",
    location: "Rio de Janeiro, RJ",
    units: 75,
    completedUnits: 75,
    status: "complete" as const,
  },
  {
    id: "3",
    name: "Condomínio Monte Azul",
    location: "Belo Horizonte, MG",
    units: 50,
    completedUnits: 10,
    status: "pending" as const,
  },
  {
    id: "4",
    name: "Residencial Parque das Flores",
    location: "Curitiba, PR",
    units: 60,
    completedUnits: 60,
    status: "complete" as const,
  },
  {
    id: "5",
    name: "Condomínio Vista Mar",
    location: "Salvador, BA",
    units: 40,
    completedUnits: 35,
    status: "progress" as const,
  },
  {
    id: "6",
    name: "Edifício Horizonte",
    location: "Brasília, DF",
    units: 80,
    completedUnits: 0,
    status: "pending" as const,
  },
];

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Building}
        title="Empreendimentos"
        description="Gerenciamento de todos os empreendimentos"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Empreendimento
        </Button>
      </PageHeader>

      <FilterBar
        searchPlaceholder="Buscar empreendimentos..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      >
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="progress">Em andamento</SelectItem>
            <SelectItem value="complete">Concluído</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};

export default Properties;