import { useState, useMemo } from "react";
import { Building, Plus, Trash2, MoreHorizontal, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
import { PropertyBulkActions } from "@/components/Properties/PropertyBulkActions";
import { DataViewMode } from "@/types";
import { EntityActionMenu } from "@/components/Shared/EntityActionMenu";
import { cn } from "@/lib/utils";

const Properties = () => {
  const {
    properties,
    isLoading,
    filteredProperties,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    selectedIds,
    setSelectedIds,
    metrics,
    clearFilters,
    createProperty,
    updateProperty,
    deleteProperty,
    bulkDelete,
    toggleSelect,
    refreshList,
    error: propertiesError
  } = useProperties();




  const [viewMode, setViewMode] = useState<DataViewMode>("grid");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { confirm } = useConfirm();

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
      <PropertyBulkActions 
        selectedCount={selectedIds.length} 
        onBulkAction={(action) => {
          if (action === "delete") bulkDelete();
        }}
        onExport={() => exportService.exportToCSV(properties, 'portfoliotecnico_a2')}
      />
      <Button 
        onClick={() => { setEditingProperty(null); setIsFormOpen(true); }} 
        className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
      >
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

      <PropertyFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={filters.status}
        onStatusChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
        managerFilter={filters.manager}
        onManagerChange={(val) => setFilters(prev => ({ ...prev, manager: val }))}

        managers={managers}
        onClearFilters={clearFilters}
      >
        <PropertyViewTabs viewMode={viewMode} onViewModeChange={(m) => setViewMode(m as DataViewMode)} />
      </PropertyFilters>
      
      <DataView<Property>
        items={filteredProperties}
        isLoading={isLoading}
        isError={!!propertiesError}
        error={{
          message: (propertiesError as any)?.message
        }}
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
              const result = await confirm({
                title: "Confirmar Exclusão",
                description: `Deseja realmente excluir o empreendimento "${property.name}"? Esta ação não pode ser desfeita.`,
                confirmLabel: "Excluir",
                variant: "destructive"
              });
              if (result) deleteProperty(property.id!);
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
              { header: "Status", accessorKey: "status", cell: (p) => <StatusBadge status={p.status} size="sm" /> },
              {
                header: "Ações",
                accessorKey: "id",
                className: "text-right",
                cell: (p) => (
                  <EntityActionMenu 
                    onEdit={() => handleOpenEdit(p)}
                    onDelete={async () => {
                      const result = await confirm({
                        title: "Confirmar Exclusão",
                        description: `Deseja realmente excluir o empreendimento "${p.name}"? Esta ação não pode ser desfeita.`,
                        confirmLabel: "Excluir",
                        variant: "destructive"
                      });
                      if (result) deleteProperty(p.id!);
                    }}
                    onView={() => setSelectedProperty(p)}
                  />
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
    </PageTemplate>
  );
};

export default Properties;
