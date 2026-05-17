
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, UserCheck, UserX, Building, Users } from "lucide-react";

interface UserFiltersProps {
  onFilterChange: (filters: any) => void;
  totalUsers: number;
  activeFilters: any;
}

export const UserFilters = ({ onFilterChange, totalUsers, activeFilters }: UserFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState(activeFilters.search || "");
  const [roleFilter, setRoleFilter] = useState(activeFilters.role || "all");
  const [statusFilter, setStatusFilter] = useState(activeFilters.status || "all");
  const [propertyFilter, setPropertyFilter] = useState(activeFilters.property || "all");
  const [unitFilter, setUnitFilter] = useState(activeFilters.unit || "");

  const handleFilterChange = () => {
    onFilterChange({
      search: searchTerm,
      role: roleFilter,
      status: statusFilter,
      property: propertyFilter,
      unit: unitFilter,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPropertyFilter("all");
    setUnitFilter("");
    onFilterChange({
      search: "",
      role: "all",
      status: "all",
      property: "all",
      unit: "",
    });
  };

  const hasActiveFilters = searchTerm || roleFilter !== "all" || statusFilter !== "all" || propertyFilter !== "all" || unitFilter !== "";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFilterChange()}
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as funções</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="manager">Gerente</SelectItem>
              <SelectItem value="technical">Técnico</SelectItem>
              <SelectItem value="client">Cliente</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Empreendimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="aurora">Edifício Aurora</SelectItem>
              <SelectItem value="bosque">Residencial Bosque Verde</SelectItem>
              <SelectItem value="monte">Condomínio Monte Alto</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleFilterChange}>
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{totalUsers} usuários encontrados</span>
          </div>
          
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              {searchTerm && <Badge variant="secondary">Busca: {searchTerm}</Badge>}
              {roleFilter !== "all" && <Badge variant="secondary">Função: {roleFilter}</Badge>}
              {statusFilter !== "all" && <Badge variant="secondary">Status: {statusFilter}</Badge>}
              {propertyFilter !== "all" && <Badge variant="secondary">Empreendimento: {propertyFilter}</Badge>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
