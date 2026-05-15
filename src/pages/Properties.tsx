import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Building, Plus, LayoutGrid, List, MoreHorizontal, Pencil, Trash2, PieChart, BarChart3, TrendingUp, Search, FilterX } from "lucide-react";
import { PropertyCard } from "@/components/Properties/PropertyCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { FilterBar } from "@/components/Layout/FilterBar";
import { cn } from "@/lib/utils";
import { DataView } from "@/components/shared/DataView";

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
import { propertyService, type Property } from "@/services/PropertyService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PropertyForm } from "@/components/Properties/PropertyForm";
import { PropertyDetailsDialog } from "@/components/Properties/PropertyDetailsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Properties = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [properties, setProperties] = useState<Property[]>(propertyService.getAll());
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [metrics, setMetrics] = useState(propertyService.getMetrics());

  useEffect(() => {
    setMetrics(propertyService.getMetrics());
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || property.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [properties, searchTerm, statusFilter]);


  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const refreshList = () => {
    setProperties(propertyService.getAll());
    if (selectedProperty) {
      const updated = propertyService.getById(selectedProperty.id!);
      if (updated) setSelectedProperty(updated);
    }
  };

  const handleCreate = (data: Property) => {
    propertyService.create(data);
    refreshList();
    setIsFormOpen(false);
    toast({ title: "Sucesso", description: "Empreendimento criado com sucesso." });
  };

  const handleUpdate = (data: Property) => {
    if (editingProperty?.id) {
      propertyService.update(editingProperty.id, data);
      refreshList();
      setEditingProperty(null);
      toast({ title: "Sucesso", description: "Empreendimento atualizado com sucesso." });
    }
  };

  const handleDelete = () => {
    if (propertyToDelete?.id) {
      propertyService.delete(propertyToDelete.id);
      refreshList();
      setPropertyToDelete(null);
      toast({ title: "Sucesso", description: "Empreendimento removido com sucesso." });
    }
  };

  const openEdit = (property: Property) => {
    setEditingProperty(property);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        icon={Building}
        title="Empreendimentos"
        description="Gestão de portfólio e progresso de obras"
      >
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex" onClick={() => toast({ title: "Relatório gerado", description: "O PDF será baixado em instantes." })}>
            Exportar PDF
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="shadow-sem-md">
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Total de Projetos" 
          value={metrics.total} 
          icon={Building} 
          trend="+1 este mês"
        />
        <MetricCard 
          label="Em Andamento" 
          value={metrics.byStatus.progress || 0} 
          icon={TrendingUp} 
          color="text-primary"
        />
        <MetricCard 
          label="Total de Unidades" 
          value={metrics.totalUnits} 
          icon={PieChart} 
        />
        <MetricCard 
          label="Progresso Médio" 
          value={`${metrics.averageProgress}%`} 
          icon={BarChart3} 
          color="text-emerald-600"
        />
      </div>

      <FilterBar
        searchPlaceholder="Buscar por nome ou cidade..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      >
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="progress">Em andamento</SelectItem>
              <SelectItem value="complete">Concluído</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || statusFilter !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
              <FilterX className="h-4 w-4 mr-2" /> Limpar
            </Button>
          )}

          <div className="h-8 w-px bg-border/40 mx-1 hidden md:block" />

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")} className="hidden md:flex bg-muted/50 p-1 rounded-xl">
            <TabsList className="bg-transparent border-none">
              <TabsTrigger value="grid" className="rounded-lg data-[state=active]:bg-background">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-background">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </FilterBar>

      <DataView
        items={filteredProperties}
        viewMode={viewMode}
        itemsPerPage={6}
        renderGrid={(property) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            onClick={() => setSelectedProperty(property)}
            onEdit={() => openEdit(property)}
            onDelete={() => setPropertyToDelete(property)}
          />
        )}
        renderList={() => (
          <div className="rounded-xl border bg-card overflow-hidden shadow-sem-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold py-4 px-6">Nome</TableHead>
                  <TableHead className="hidden md:table-cell font-bold py-4 px-6">Localização</TableHead>
                  <TableHead className="font-bold py-4 px-6">Progresso</TableHead>
                  <TableHead className="font-bold py-4 px-6">Status</TableHead>
                  <TableHead className="text-right font-bold py-4 px-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => {
                  const percentage = Math.round((property.completedUnits / property.units) * 100);
                  return (
                    <TableRow 
                      key={property.id} 
                      className="group hover:bg-muted/20 transition-all border-b border-border/50 cursor-pointer"
                      onClick={() => setSelectedProperty(property)}
                    >
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-label group-hover:text-primary transition-colors">{property.name}</span>
                          <span className="md:hidden text-caption mt-0.5 text-muted-foreground">
                            {property.location}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-body-sm text-muted-foreground py-4 px-6">{property.location}</TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3 min-w-[120px] max-w-[200px]">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden border border-border/10">
                            <div 
                              className={cn(
                                "h-full transition-all duration-700",
                                property.status === 'complete' ? "bg-status-complete" : "bg-primary"
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sem-tiny font-bold text-foreground whitespace-nowrap">{percentage}%</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        <StatusBadge status={property.status} size="sm" />
                      </TableCell>
                      <TableCell className="text-right py-4 px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-primary/5 active:scale-95 transition-all">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 shadow-sem-lg animate-in fade-in zoom-in-95 duration-200">
                            <DropdownMenuItem onClick={() => openEdit(property)} className="cursor-pointer py-2.5 font-medium">
                              <Pencil className="mr-2 h-4 w-4 text-muted-foreground" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive cursor-pointer py-2.5 font-bold" 
                              onClick={() => setPropertyToDelete(property)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        emptyState={{
          title: "Nenhum empreendimento encontrado",
          description: "Tente ajustar seus filtros ou cadastre um novo empreendimento para começar.",
          action: {
            label: "Limpar filtros",
            onClick: clearFilters
          }
        }}
      />

      {/* Create Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Novo Empreendimento</DialogTitle>
          </DialogHeader>
          <PropertyForm onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProperty} onOpenChange={(open) => !open && setEditingProperty(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Empreendimento</DialogTitle>
          </DialogHeader>
          {editingProperty && (
            <PropertyForm 
              initialData={editingProperty} 
              onSubmit={handleUpdate} 
              onCancel={() => setEditingProperty(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!propertyToDelete} onOpenChange={(open) => !open && setPropertyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o empreendimento
              <strong> {propertyToDelete?.name}</strong> e todos os dados associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir Empreendimento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PropertyDetailsDialog 
        property={selectedProperty} 
        open={!!selectedProperty} 
        onOpenChange={(open) => !open && setSelectedProperty(null)}
        onUpdate={refreshList}
      />
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, trend, color }: any) => (
  <div className="bg-card/50 backdrop-blur-sm border-none p-5 rounded-2xl shadow-sem-sm flex flex-col gap-3">
    <div className="flex justify-between items-start">
      <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
        <Icon size={18} />
      </div>
      {trend && (
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-tiny font-black text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className={cn("text-2xl font-black mt-0.5", color || "text-foreground")}>{value}</p>
    </div>
  </div>
);

export default Properties;
