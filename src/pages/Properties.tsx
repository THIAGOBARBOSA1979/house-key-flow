import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building, Plus, SearchX, LayoutGrid, List } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";

const properties = [
  { id: "1", name: "Edifício Aurora", location: "São Paulo, SP", units: 120, completedUnits: 85, status: "progress" as const },
  { id: "2", name: "Residencial Bosque Verde", location: "Rio de Janeiro, RJ", units: 75, completedUnits: 75, status: "complete" as const },
  { id: "3", name: "Condomínio Monte Azul", location: "Belo Horizonte, MG", units: 50, completedUnits: 10, status: "pending" as const },
  { id: "4", name: "Residencial Parque das Flores", location: "Curitiba, PR", units: 60, completedUnits: 60, status: "complete" as const },
  { id: "5", name: "Condomínio Vista Mar", location: "Salvador, BA", units: 40, completedUnits: 35, status: "progress" as const },
  { id: "6", name: "Edifício Horizonte", location: "Brasília, DF", units: 80, completedUnits: 0, status: "pending" as const },
];

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

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
        <div className="flex items-center gap-2">
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

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")} className="hidden md:flex">
            <TabsList>
              <TabsTrigger value="grid">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </FilterBar>

      {filteredProperties.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Unidades</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => {
                  const percentage = Math.round((property.completedUnits / property.units) * 100);
                  return (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">{property.name}</TableCell>
                      <TableCell>{property.location}</TableCell>
                      <TableCell>{property.completedUnits} / {property.units}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-company" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={property.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Ver</Button>
                        <Button variant="ghost" size="sm">Editar</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-1">Nenhum empreendimento encontrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Nenhum resultado corresponde aos filtros aplicados.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default Properties;
