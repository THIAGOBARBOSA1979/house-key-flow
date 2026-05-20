
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Users } from "lucide-react";
import { UserFiltersData } from "@/types/user";

interface UserFiltersProps {
  onFilterChange: (filters: Partial<UserFiltersData>) => void;
  totalUsers: number;
  activeFilters: UserFiltersData;
}

export const UserFilters = ({ onFilterChange, totalUsers, activeFilters }: UserFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState(activeFilters.search || "");
  const [roleFilter, setRoleFilter] = useState(activeFilters.role || "all");
  const [statusFilter, setStatusFilter] = useState(activeFilters.status || "all");
  const [propertyFilter, setPropertyFilter] = useState(activeFilters.property || "all");
  const [unitFilter, setUnitFilter] = useState(activeFilters.unit || "");

  useEffect(() => {
    setSearchTerm(activeFilters.search || "");
    setRoleFilter(activeFilters.role || "all");
    setStatusFilter(activeFilters.status || "all");
    setPropertyFilter(activeFilters.property || "all");
    setUnitFilter(activeFilters.unit || "");
  }, [activeFilters]);

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
    <Card className="border-none shadow-sem-sm bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden">
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nome, email ou telefone..."
              className="pl-9 h-11 rounded-xl bg-background border-none shadow-sem-sm transition-all focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFilterChange()}
            />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2 md:gap-3">
            <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); onFilterChange({ role: val }); }}>
              <SelectTrigger className="w-full lg:w-[150px] rounded-xl h-11 bg-background border-none shadow-sem-sm">
                <SelectValue placeholder="Função" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-sem-xl">
                <SelectItem value="all">Todas as funções</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="technical">Técnico</SelectItem>
                <SelectItem value="client">Cliente</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); onFilterChange({ status: val }); }}>
              <SelectTrigger className="w-full lg:w-[120px] rounded-xl h-11 bg-background border-none shadow-sem-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-sem-xl">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={propertyFilter} onValueChange={(val) => { setPropertyFilter(val); onFilterChange({ property: val }); }}>
              <SelectTrigger className="w-full lg:w-[180px] rounded-xl h-11 bg-background border-none shadow-sem-sm">
                <SelectValue placeholder="Empreendimento" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-sem-xl">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="aurora">Edifício Aurora</SelectItem>
                <SelectItem value="bosque">Residencial Bosque Verde</SelectItem>
                <SelectItem value="monte">Condomínio Monte Alto</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Unidade"
              className="w-full lg:w-[100px] rounded-xl h-11 bg-background border-none shadow-sem-sm"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFilterChange()}
            />
          </div>
          
          <div className="flex gap-2 mt-2 lg:mt-0">
            <Button onClick={handleFilterChange} className="flex-1 lg:flex-none h-11 rounded-xl font-bold px-6">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="h-11 rounded-xl text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-3">
          <div className="flex items-center gap-2 text-sem-tiny font-black uppercase tracking-widest text-muted-foreground/60">
            <Users className="h-3 w-3" />
            <span>{totalUsers} registros localizados</span>
          </div>
          
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mr-1">Filtros:</span>
              {searchTerm && <Badge variant="secondary" className="rounded-lg text-[9px] font-black uppercase px-2 py-0.5 bg-primary/5 text-primary border-none">Busca: {searchTerm}</Badge>}
              {roleFilter !== "all" && <Badge variant="secondary" className="rounded-lg text-[9px] font-black uppercase px-2 py-0.5 bg-primary/5 text-primary border-none">Função: {roleFilter}</Badge>}
              {statusFilter !== "all" && <Badge variant="secondary" className="rounded-lg text-[9px] font-black uppercase px-2 py-0.5 bg-primary/5 text-primary border-none">Status: {statusFilter}</Badge>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
