import { useState, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Building, Plus, LayoutGrid, List, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

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
    <div className="space-y-6">
      <PageHeader
        icon={Building}
        title="Empreendimentos"
        description="Gerenciamento de todos os empreendimentos"
      >
        <Button onClick={() => setIsFormOpen(true)}>
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

      <DataView
        items={filteredProperties}
        viewMode={viewMode}
        renderGrid={(property) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
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
                    <TableRow key={property.id} className="group hover:bg-muted/20 transition-all border-b border-border/50">
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
                          <DropdownMenuTrigger asChild>
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
    </div>
  );
};

export default Properties;
