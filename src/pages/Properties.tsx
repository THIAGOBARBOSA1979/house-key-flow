import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Building, Plus, LayoutGrid, List, MoreHorizontal, Pencil, Trash2, PieChart, BarChart3, TrendingUp, FilterX, Download, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PropertyCard } from "@/components/Properties/PropertyCard";
import { PageHeader } from "@/components/Layout/PageHeader";
import { FilterBar } from "@/components/Layout/FilterBar";
import { cn } from "@/lib/utils";
import { DataView } from "@/components/shared/DataView";
import { DataTable } from "@/components/shared/DataTable";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";

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
  const [managerFilter, setManagerFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "timeline">("grid");
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
      const matchesManager = managerFilter === "all" || property.manager === managerFilter;
      return matchesSearch && matchesStatus && matchesManager;
    });
  }, [properties, searchTerm, statusFilter, managerFilter]);


  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setManagerFilter("all");
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
        description="Gestão de portfólio e acompanhamento do progresso físico das obras"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="hidden sm:flex rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95" onClick={() => toast({ title: "Relatório gerado", description: "O PDF consolidado do portfólio será baixado em instantes." })}>
            <Download className="mr-2 h-4 w-4" /> Exportar PDF
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
            <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
            Novo Empreendimento
          </Button>
        </div>
      </PageHeader>

      <ResponsiveGrid columns={4} gap="layout">
        <StatsCard 
          label="Total de Projetos" 
          value={metrics.total} 
          icon={Building} 
          description="Ativos no portfólio"
          trend={{ value: "12%", isPositive: true }}
          className="rounded-3xl"
        />
        <StatsCard 
          label="Em Andamento" 
          value={metrics.byStatus.progress || 0} 
          icon={TrendingUp} 
          variant="progress"
          description="Obras em execução"
          className="rounded-3xl"
        />
        <StatsCard 
          label="Total de Unidades" 
          value={metrics.totalUnits} 
          icon={PieChart} 
          variant="brand"
          description="Apartamentos cadastrados"
          className="rounded-3xl"
        />
        <StatsCard 
          label="Eficiência Média" 
          value={`${metrics.averageProgress}%`} 
          icon={BarChart3} 
          variant="complete"
          description="Progresso consolidado"
          className="rounded-3xl"
        />
      </ResponsiveGrid>


      <FilterBar
        searchPlaceholder="Buscar por nome, cidade ou código do projeto..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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

          <Select value={managerFilter} onValueChange={setManagerFilter}>
            <SelectTrigger className="w-full sm:w-[170px] rounded-xl h-11 bg-background shadow-sem-sm">
              <SelectValue placeholder="Gerente" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-sem-xl animate-in zoom-in-95">
              <SelectItem value="all" className="rounded-lg font-medium">Todos Gerentes</SelectItem>
              {Array.from(new Set(properties.map(p => p.manager).filter(Boolean))).map(manager => (
                <SelectItem key={manager} value={manager!} className="rounded-lg font-medium">{manager}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchTerm || statusFilter !== "all" || managerFilter !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground h-11 rounded-xl px-4 font-bold uppercase text-[10px] tracking-widest">
              <FilterX className="h-4 w-4 mr-2" /> Limpar Filtros
            </Button>
          )}

          <div className="h-8 w-px bg-border/40 mx-2 hidden lg:block" />

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="hidden md:flex bg-muted/40 p-1.5 rounded-2xl shadow-inner shrink-0">
            <TabsList className="bg-transparent border-none h-9 gap-1">
              <TabsTrigger value="grid" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sem-md h-full transition-all">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sem-md h-full transition-all">
                <List className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sem-md h-full transition-all px-3 gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Timeline</span>
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
          <DataTable
            columns={[
              { 
                header: "Nome", 
                accessorKey: "name",
                cell: (p) => (
                  <div className="flex flex-col">
                    <span className="text-label group-hover:text-primary transition-colors">{p.name}</span>
                    <span className="md:hidden text-caption mt-0.5 text-muted-foreground">{p.location}</span>
                  </div>
                )
              },
              { header: "Localização", accessorKey: "location", className: "hidden md:table-cell text-muted-foreground" },
              { 
                header: "Progresso", 
                accessorKey: "progress",
                cell: (p) => {
                  const percentage = Math.round((p.completedUnits / p.units) * 100);
                  return (
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden border border-border/10">
                        <div 
                          className={cn(
                            "h-full transition-all duration-700",
                            p.status === 'complete' ? "bg-status-complete" : "bg-primary"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sem-tiny font-black text-foreground">{percentage}%</span>
                    </div>
                  );
                }
              },
              { 
                header: "Status", 
                accessorKey: "status", 
                cell: (p) => <StatusBadge status={p.status} size="sm" /> 
              },
              {
                header: "Ações",
                accessorKey: "id",
                className: "text-right",
                cell: (p) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-primary/5">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 shadow-sem-lg">
                      <DropdownMenuItem onClick={() => openEdit(p)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive font-bold" 
                        onClick={() => setPropertyToDelete(p)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }
            ]}
            data={filteredProperties}
            onRowClick={(p) => setSelectedProperty(p)}
          />
        )}
        renderTimeline={() => (
          <div className="space-y-8">
            <Card className="p-6 border-none bg-primary/5 rounded-[2rem]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black uppercase tracking-widest text-primary flex items-center gap-3">
                  <BarChart3 className="w-6 h-6" />
                  Visão Consolidada de Cronograma
                </h3>
              </div>
              <div className="space-y-6">
                {filteredProperties.map(property => (
                  <div key={property.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sem-sm flex items-center justify-center text-primary font-black">
                          {property.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{property.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{property.location}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-background/80 font-black text-[10px] uppercase tracking-widest">{property.status}</Badge>
                    </div>
                    <div className="grid grid-cols-12 gap-1 h-8">
                      {property.milestones?.map((m, idx) => (
                        <div 
                          key={m.id} 
                          className={cn(
                            "h-full rounded-md flex items-center justify-center transition-all group relative cursor-pointer",
                            m.completed ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]" : "bg-slate-200/50"
                          )}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none">
                            {m.title} - {m.completed ? 'Concluído' : 'Pendente'}
                          </div>
                          {m.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                      ))}
                      {!property.milestones && (
                        <div className="col-span-12 h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 bg-slate-100 rounded-md">
                          Configurar marcos de obra para visualizar timeline
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none shadow-sem-xl rounded-3xl bg-background/95 backdrop-blur-2xl">
          <DialogHeader className="px-10 pt-10 pb-8 bg-primary/5 border-b border-border/10">
            <DialogTitle className="text-3xl font-black tracking-tighter flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sem-sm">
                <Building className="w-8 h-8 text-primary" strokeWidth={3} />
              </div>
              Novo Empreendimento
            </DialogTitle>
          </DialogHeader>
          <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <PropertyForm onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>


      {/* Edit Dialog */}
      <Dialog open={!!editingProperty} onOpenChange={(open) => !open && setEditingProperty(null)}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/5">
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Editar Empreendimento
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            {editingProperty && (
              <PropertyForm 
                initialData={editingProperty} 
                onSubmit={handleUpdate} 
                onCancel={() => setEditingProperty(null)} 
              />
            )}
          </div>
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


export default Properties;
