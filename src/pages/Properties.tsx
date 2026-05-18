import { useState } from "react";
import { Building, Plus, LayoutGrid, List, MoreHorizontal, Pencil, Trash2, PieChart, BarChart3, TrendingUp, FilterX, Download, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { exportService } from "@/services/ExportService";
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
import { useProperties } from "@/hooks/useProperties";
import { Property } from "@/services/PropertyService";
import { Button } from "@/components/ui/button";

const Properties = () => {
  const {
    properties,
    filteredProperties,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    managerFilter,
    setManagerFilter,
    selectedIds,
    setSelectedIds,
    metrics,
    clearFilters,
    createProperty,
    updateProperty,
    deleteProperty,
    bulkDelete,
    toggleSelect,
    refreshList
  } = useProperties();

  const [viewMode, setViewMode] = useState<"grid" | "list" | "timeline">("grid");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  const handleOpenEdit = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <PageHeader
        icon={Building}
        title="Empreendimentos"
        description="Gestão de portfólio e acompanhamento do progresso físico das obras"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="hidden sm:flex rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95" onClick={() => exportService.exportToCSV(properties, 'empreendimentos_a2')}>
            <Download className="mr-2 h-4 w-4" /> Exportar Planilha
          </Button>
          <Button onClick={() => { setEditingProperty(null); setIsFormOpen(true); }} className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
            <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
            Novo Empreendimento
          </Button>
        </div>
      </PageHeader>

      <ResponsiveGrid columns={4} gap="layout">
        <StatsCard label="Total de Projetos" value={metrics.total} icon={Building} description="Ativos no portfólio" trend={{ value: "12%", isPositive: true }} className="rounded-3xl" />
        <StatsCard label="Em Andamento" value={metrics.byStatus.progress || 0} icon={TrendingUp} variant="progress" description="Obras em execução" className="rounded-3xl" />
        <StatsCard label="Total de Unidades" value={metrics.totalUnits} icon={PieChart} variant="brand" description="Apartamentos cadastrados" className="rounded-3xl" />
        <StatsCard label="Eficiência Média" value={`${metrics.averageProgress}%`} icon={BarChart3} variant="complete" description="Progresso consolidado" className="rounded-3xl" />
      </ResponsiveGrid>

      {selectedIds.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20 animate-in zoom-in-95 duration-200 rounded-2xl border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-white p-2 rounded-xl"><Settings className="w-5 h-5 animate-spin-slow" /></div>
            <div>
              <p className="text-sm font-black text-primary uppercase tracking-widest leading-none">Ações em Lote</p>
              <p className="text-xs text-muted-foreground font-bold">{selectedIds.length} selecionados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 font-bold" onClick={() => setSelectedIds([])}>Cancelar</Button>
             <Button variant="destructive" size="sm" className="rounded-xl h-10 px-4 font-bold gap-2" onClick={bulkDelete}><Trash2 className="w-4 h-4" /> Excluir permanentemente</Button>
          </div>
        </Card>
      )}

      <FilterBar searchPlaceholder="Buscar..." searchValue={searchTerm} onSearchChange={setSearchTerm}>
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
              <TabsTrigger value="grid" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sem-md h-full transition-all"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="list" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sem-md h-full transition-all"><List className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sem-md h-full transition-all px-3 gap-2"><BarChart3 className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Timeline</span></TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </FilterBar>

      <DataView<Property>
        items={filteredProperties}
        viewMode={viewMode}
        itemsPerPage={6}
        renderGrid={(property) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            onClick={() => setSelectedProperty(property)}
            onEdit={() => handleOpenEdit(property)}
            onDelete={() => setPropertyToDelete(property)}
          />
        )}
        renderList={(items) => (
          <DataTable
            columns={[
              {
                header: "",
                accessorKey: "id",
                cell: (p) => (
                  <Checkbox 
                    checked={selectedIds.includes(p.id!)}
                    onCheckedChange={() => toggleSelect(p.id!)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )
              },
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
                        <div className={cn("h-full transition-all duration-700", p.status === 'complete' ? "bg-status-complete" : "bg-primary")} style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-sem-tiny font-black text-foreground">{percentage}%</span>
                    </div>
                  );
                }
              },
              { header: "Status", accessorKey: "status", cell: (p) => <StatusBadge status={p.status} size="sm" /> },
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
                      <DropdownMenuItem onClick={() => handleOpenEdit(p)} className="cursor-pointer"><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive font-bold" onClick={() => setPropertyToDelete(p)}><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }
            ]}
            data={items}
            onRowClick={(p) => setSelectedProperty(p)}
          />
        )}
        renderTimeline={(items) => (
          <div className="space-y-6">
            {items.map(property => (
              <Card key={property.id} className="card-standard border-none bg-card/40 backdrop-blur-md overflow-hidden p-6 rounded-3xl shadow-sem-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-full md:w-1/4">
                    <h4 className="text-lg font-black tracking-tight">{property.name}</h4>
                    <p className="text-xs text-muted-foreground font-medium">{property.location}</p>
                    <div className="mt-4"><StatusBadge status={property.status} size="sm" /></div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span>Cronograma de Obra</span>
                      <span>{Math.round((property.completedUnits / property.units) * 100)}% Concluído</span>
                    </div>
                    <div className="relative h-12 w-full bg-muted/30 rounded-2xl border border-border/5 overflow-hidden p-1 flex gap-1">
                      {property.milestones?.map((m) => (
                        <div key={m.id} className={cn("h-full rounded-xl flex-1 flex items-center justify-center transition-all group relative", m.completed ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-muted/50")}>
                           <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10 border border-border">{m.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black tracking-tight">{editingProperty ? "Editar" : "Novo"} Empreendimento</DialogTitle>
          </DialogHeader>
          <PropertyForm 
            onSubmit={(data) => {
              editingProperty ? updateProperty(editingProperty.id!, data) : createProperty(data);
              setIsFormOpen(false);
            }}
            onCancel={() => setIsFormOpen(false)}
            initialData={editingProperty || undefined}
          />
        </DialogContent>
      </Dialog>

      {selectedProperty && (
        <PropertyDetailsDialog 
          open={!!selectedProperty} 
          onOpenChange={(open) => !open && setSelectedProperty(null)} 
          property={selectedProperty} 
          onUpdate={refreshList}
        />
      )}

      <AlertDialog open={!!propertyToDelete} onOpenChange={(open) => !open && setPropertyToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="font-medium">
              Deseja realmente excluir o empreendimento <span className="font-black text-foreground">"{propertyToDelete?.name}"</span>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-0">
            <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => propertyToDelete?.id && deleteProperty(propertyToDelete.id)} className="bg-destructive hover:bg-destructive/90 rounded-xl font-black uppercase tracking-widest text-xs">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Properties;
