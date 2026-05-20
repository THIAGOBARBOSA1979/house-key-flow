import { useState, useMemo } from "react";
import { 
  Wrench, 
  Plus, 
  Mail, 
  Phone, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Search,
  FilterX,
  Star,
  CheckCircle2,
  Clock,
  Briefcase,
  Settings
} from "lucide-react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks";
import { technicianService, type Technician } from "@/services";
import { DataView } from "@/components/Shared/DataView";

import { StatsCard } from "@/components/Shared/StatsCard";
import { ResponsiveGrid } from "@/components/Shared/ResponsiveGrid";
import { cn } from "@/lib/utils";
import { exportService } from "@/services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TechnicianForm } from "@/components/Admin/TechnicianForm";
import { Checkbox } from "@/components/ui/checkbox";

const Technicians = () => {
  const { toast } = useToast();
  const {
    technicians,
    isLoading,
    selectedIds,
    stats,
    saveTechnician,
    deleteTechnician,
    toggleTechnicianStatus,
    handleBulkDelete,
    toggleSelect,
    clearSelection,
    exportData
  } = useTechnicians();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);

  const filteredTechnicians = useMemo(() => {
    return technicians.filter(tech => {
      const searchLower = searchTerm.toLowerCase();
      return tech.name.toLowerCase().includes(searchLower) ||
             tech.email.toLowerCase().includes(searchLower) ||
             tech.specialty.some(s => s.toLowerCase().includes(searchLower));
    });
  }, [technicians, searchTerm]);

  const handleSave = (data: any) => {
    saveTechnician(data, editingTech?.id);
    setIsFormOpen(false);
    setEditingTech(null);
  };

  const handleEdit = (tech: Technician) => {
    setEditingTech(tech);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTechnician(id);
  };

  const toggleStatus = (tech: Technician) => {
    toggleTechnicianStatus(tech.id);
  };

  const handleBulkDeleteAction = () => {
    handleBulkDelete();
  };

  const handleSelect = (id: string) => {
    toggleSelect(id);
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <PageHeader 
        icon={Wrench} 
        title="Gestão de Técnicos" 
        description="Gerenciamento de prestadores de serviço, especialidades e avaliações de desempenho."
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
          <Button onClick={() => { setEditingTech(null); setIsFormOpen(true); }} className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
            Novo Técnico
          </Button>
        </div>
      </PageHeader>

      <ResponsiveGrid columns={4} gap="layout">
        <StatsCard label="Total de Técnicos" value={stats.total} icon={Wrench} variant="brand" className="rounded-3xl" />
        <StatsCard label="Ativos" value={stats.active} icon={CheckCircle2} variant="complete" className="rounded-3xl" />
        <StatsCard label="Avaliação Média" value={stats.avgRating} icon={Star} variant="progress" className="rounded-3xl" />
        <StatsCard label="Serviços Concluídos" value={stats.totalJobs} icon={Briefcase} variant="default" className="rounded-3xl" />
      </ResponsiveGrid>

      {selectedIds.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20 animate-in zoom-in-95 duration-200 rounded-2xl border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-white p-2 rounded-xl">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <p className="text-sm font-black text-primary uppercase tracking-widest leading-none">Ações em Lote</p>
              <p className="text-xs text-muted-foreground font-bold">{selectedIds.length} técnicos selecionados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 font-bold" onClick={clearSelection}>
               Cancelar
             </Button>
             <Button variant="destructive" size="sm" className="rounded-xl h-10 px-4 font-bold gap-2" onClick={handleBulkDeleteAction}>
               <Trash2 className="w-4 h-4" /> Excluir permanentemente
             </Button>
          </div>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/40 backdrop-blur-md p-4 rounded-2xl border border-border/10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, especialidade ou email..." 
            className="pl-10 h-11 rounded-xl border-none bg-background/50 focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <Button variant="ghost" onClick={() => setSearchTerm("")} className="text-muted-foreground hover:text-foreground">
            <FilterX className="mr-2 h-4 w-4" /> Limpar filtros
          </Button>
        )}
      </div>

      <DataView<Technician>
        items={filteredTechnicians}
        isLoading={isLoading}
        viewMode="grid"
        itemsPerPage={6}
        skeletonType="card"
        renderGrid={(tech) => (
          <Card key={tech.id} className={cn(
            "card-standard overflow-hidden border-none bg-card/40 backdrop-blur-md hover:shadow-sem-lg transition-all group relative",
            selectedIds.includes(tech.id) && "ring-2 ring-primary"
          )}>
            <div className="absolute top-4 left-4 z-10">
              <Checkbox 
                checked={selectedIds.includes(tech.id)}
                onCheckedChange={() => handleSelect(tech.id)}
                className="rounded-md"
              />
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4 pl-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                    <Wrench size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{tech.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-black">{tech.rating}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-sem-xl border-none">
                    <DropdownMenuItem className="py-3 rounded-xl font-bold cursor-pointer" onClick={() => toast({ title: "Perfil do Técnico", description: `Visualizando dados de ${tech.name}.` })}>
                      <Eye className="mr-3 h-4 w-4 text-muted-foreground" /> Ver Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem className="py-3 rounded-xl font-bold cursor-pointer" onClick={() => handleEdit(tech)}>
                      <Edit className="mr-3 h-4 w-4 text-muted-foreground" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="py-3 rounded-xl font-bold cursor-pointer" onClick={() => toggleStatus(tech)}>
                      <Clock className="mr-3 h-4 w-4 text-muted-foreground" /> {tech.status === 'active' ? 'Desativar' : 'Ativar'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2 bg-border/10" />
                    <DropdownMenuItem className="py-3 rounded-xl font-black text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer" onClick={() => handleDelete(tech.id)}>
                      <Trash2 className="mr-3 h-4 w-4" /> Excluir permanentemente
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3 mb-6 pl-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                  <Mail size={16} className="text-primary/60" />
                  <span className="truncate">{tech.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                  <Phone size={16} className="text-primary/60" />
                  <span>{tech.phone}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 pl-6">
                {tech.specialty.map((s) => (
                  <Badge key={s} variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1 rounded-lg">
                    {s}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/10 pl-6">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Concluídos</p>
                  <p className="text-xl font-black">{tech.completedJobs}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Ativos</p>
                  <p className="text-xl font-black text-primary">{tech.activeJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        emptyState={{
          title: "Nenhum técnico encontrado",
          description: "Ajuste os filtros para encontrar o que procura.",
          action: { label: "Limpar filtros", onClick: () => setSearchTerm("") }
        }}
      />


      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-dialog-md rounded-3xl border-none shadow-sem-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              {editingTech ? "Editar Técnico" : "Novo Cadastro de Técnico"}
            </DialogTitle>
          </DialogHeader>
          <TechnicianForm 
            initialData={editingTech} 
            onSubmit={handleSave} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Technicians;
