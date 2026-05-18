import { useState, useMemo } from "react";
import { Building, Plus, Trash2, Download, Settings, MoreHorizontal, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { PropertyCard } from "@/components/Properties/PropertyCard";
import { PageTemplate } from "@/components/Layout/PageTemplate";
import { DataView } from "@/components/Shared/DataView";
import { DataTable } from "@/components/Shared/DataTable";
import { StatusBadge } from "@/components/Shared/StatusBadge";

import { exportService } from "@/services";
import { formatDate } from "@/utils/formatters";
import { useProperties, useConfirm } from "@/hooks";
import { Property } from "@/services";
import { Button } from "@/components/ui/button";
import { PropertyStats } from "@/components/Properties/PropertyStats";
import { PropertyFilters } from "@/components/Properties/PropertyFilters";
import { PropertyViewTabs } from "@/components/Properties/PropertyViewTabs";
import { PropertyDialogs } from "@/components/Properties/PropertyDialogs";
import { PropertyTimeline } from "@/components/Properties/PropertyTimeline";

import { DataViewMode } from "@/components/Shared/DataView";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";



const Properties = () => {
  const {
    properties,
    isLoading,
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

  const [viewMode, setViewMode] = useState<DataViewMode>("grid");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { confirm, isOpen: isConfirmOpen, handleConfirm, handleCancel, options: confirmOptions } = useConfirm();

  const managers = useMemo(() => 
    Array.from(new Set(properties.map(p => p.manager).filter(Boolean))) as string[],
    [properties]
  );

  const handleOpenEdit = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const actions = (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" className="hidden sm:flex rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95" onClick={() => exportService.exportToCSV(properties, 'portfoliotecnico_a2')}>
        <Download className="mr-2 h-4 w-4" /> Exportar Portfólio

      </Button>
      <Button onClick={() => { setEditingProperty(null); setIsFormOpen(true); }} className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
        <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
        Novo Ativo Imobiliário
      </Button>
    </div>
  );

  return (
    <PageTemplate
      title="Inteligência de Portfólio"
      description="Gerencie seu ecossistema de empreendimentos com foco em progresso físico e eficiência operacional."

      icon={Building}
      actions={actions}
    >
      <PropertyStats metrics={metrics} />

      {selectedIds.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20 animate-in zoom-in-95 duration-200 rounded-2xl border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-white p-2 rounded-xl"><Settings className="w-5 h-5 animate-spin-slow" /></div>
            <div>
              <p className="text-sm font-black text-primary uppercase tracking-widest leading-none">Ações em Lote Operacional</p>
              <p className="text-xs text-muted-foreground font-bold">{selectedIds.length} selecionados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 font-bold" onClick={() => setSelectedIds([])}>Cancelar</Button>
             <Button variant="destructive" size="sm" className="rounded-xl h-10 px-4 font-bold gap-2" onClick={bulkDelete}><Trash2 className="w-4 h-4" /> Excluir permanentemente</Button>
          </div>
        </Card>
      )}

      <PropertyFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        managerFilter={managerFilter}
        onManagerChange={setManagerFilter}
        managers={managers}
        onClearFilters={clearFilters}
      >
        <PropertyViewTabs viewMode={viewMode} onViewModeChange={(m) => setViewMode(m as DataViewMode)} />
      </PropertyFilters>
      
      <DataView<Property>
        items={filteredProperties}
        isLoading={isLoading}
        skeletonType="card"

        viewMode={viewMode}
        itemsPerPage={6}
        renderGrid={(property) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            onClick={() => setSelectedProperty(property)}
            onEdit={() => handleOpenEdit(property)}
            onDelete={async () => {
              if (await confirm({
                title: "Confirmar Exclusão",
                description: `Deseja realmente excluir o empreendimento "${property.name}"? Esta ação não pode ser desfeita.`,
                confirmLabel: "Excluir",
              })) {
                deleteProperty(property.id!);
              }
            }}
          />
        )}
        renderTable={(items) => (
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
              { header: "Início", accessorKey: "createdAt", className: "hidden lg:table-cell text-muted-foreground", cell: (p) => formatDate(p.createdAt) },
              { 
                header: "Progresso", 
                accessorKey: "completedUnits",
                cell: (p) => {
                  const percentage = p.units ? Math.round((p.completedUnits / p.units) * 100) : 0;
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
                    <DropdownMenuTrigger asChild onClick={(e) => { e.stopPropagation(); }}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-primary/5">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 shadow-sem-lg">
                      <DropdownMenuItem onClick={() => handleOpenEdit(p)} className="cursor-pointer"><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive font-bold" onClick={async () => {
                        if (await confirm({
                          title: "Confirmar Exclusão",
                          description: `Deseja realmente excluir o empreendimento "${p.name}"? Esta ação não pode ser desfeita.`,
                          confirmLabel: "Excluir",
                        })) {
                          deleteProperty(p.id!);
                        }
                      }}><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }
            ]}
            data={items as Property[]}
            onRowClick={(p) => setSelectedProperty(p)}
          />
        )}
        renderTimeline={(items) => <PropertyTimeline items={items as Property[]} />}

      />


      <PropertyDialogs 
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        editingProperty={editingProperty}
        selectedProperty={selectedProperty}
        setSelectedProperty={setSelectedProperty}
        onSave={(id, data) => id ? updateProperty(id, data) : createProperty(data)}
        onRefresh={refreshList}
      />

      <ConfirmationDialog 
        isOpen={isConfirmOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        {...confirmOptions}
      />
    </PageTemplate>
  );
};

export default Properties;


