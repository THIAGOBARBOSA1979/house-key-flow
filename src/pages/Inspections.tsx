import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ClipboardCheck, 
  Calendar as CalendarIcon, 
  History, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  BarChart, 
  LayoutGrid, 
  Filter, 
  Download,
  Users,
  Building,
  ClipboardList
} from "lucide-react";
import { InspectionItem } from "@/components/Inspection/InspectionItem";
import { PageHeader } from "@/components/Layout/PageHeader";
import { FilterBar } from "@/components/Layout/FilterBar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScheduleInspectionDialog } from "@/components/Inspection/ScheduleInspectionDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLogViewer } from "@/components/Admin/AuditLogViewer";
import { inspectionService } from "@/services/InspectionService";
import { InspectionCalendar } from "@/components/Inspection/InspectionCalendar";
import { StatsCard } from "@/components/shared/StatsCard";
import { DataView } from "@/components/shared/DataView";
import { cn } from "@/lib/utils";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as ReTooltip, 
  Legend 
} from 'recharts';
import { useToast } from "@/components/ui/use-toast";

export default function Inspections() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTechnician, setFilterTechnician] = useState("all");
  const [filterProperty, setFilterProperty] = useState("all");
  const [filterChecklist, setFilterChecklist] = useState("all");
  const [activeTab, setActiveTab] = useState("list");
  const [inspections, setInspections] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const { toast } = useToast();

  const loadData = () => {
    setInspections(inspectionService.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      const matchesSearch = 
        inspection.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.unit.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || inspection.status === filterStatus;
      const matchesTech = filterTechnician === "all" || inspection.technician === filterTechnician;
      const matchesProperty = filterProperty === "all" || inspection.property === filterProperty;
      const matchesChecklist = filterChecklist === "all" || inspection.checklistId === filterChecklist;
      
      return matchesSearch && matchesStatus && matchesTech && matchesProperty && matchesChecklist;
    });
  }, [inspections, searchTerm, filterStatus, filterTechnician, filterProperty, filterChecklist]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterTechnician("all");
    setFilterProperty("all");
    setFilterChecklist("all");
  };

  const handleExport = () => {
    const data = inspectionService.exportData('csv');
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-vistorias-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Relatório gerado",
      description: "O arquivo CSV foi baixado com sucesso.",
    });
  };

  const stats = useMemo(() => {
    return {
      pending: inspections.filter(i => i.status === "pending").length,
      completed: inspections.filter(i => i.status === "complete").length,
      delayed: inspections.filter(i => {
        const date = new Date(i.date || i.scheduledDate);
        return i.status === "pending" && date < new Date();
      }).length
    };
  }, [inspections]);


  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        title="Vistorias"
        description="Gerenciamento de vistorias e entregas de unidades"
      >
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            onClick={handleExport}
            className="interactive-active"
          >
            <Download className="mr-2 h-4 w-4" />
            Relatório
          </Button>
          <Button 
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
            className="interactive-active"
          >
            {viewMode === "calendar" ? <LayoutGrid className="mr-2 h-4 w-4" /> : <CalendarIcon className="mr-2 h-4 w-4" />}
            {viewMode === "calendar" ? "Lista" : "Calendário"}
          </Button>
          <ScheduleInspectionDialog onSuccess={loadData} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard 
          label="Pendentes" 
          value={stats.pending} 
          icon={Clock} 
          variant="pending"
          description="Vistorias aguardando realização"
        />
        <StatsCard 
          label="Concluídas" 
          value={stats.completed} 
          icon={CheckCircle2} 
          variant="complete"
          description="Total de vistorias finalizadas"
        />
        <StatsCard 
          label="Atrasadas" 
          value={stats.delayed} 
          icon={AlertCircle} 
          variant="critical"
          description="Vistorias fora do prazo previsto"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="list" className="gap-2 rounded-lg py-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ClipboardCheck className="h-4 w-4" />
            Vistorias
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 rounded-lg py-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2 rounded-lg py-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <History className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <FilterBar
            searchPlaceholder="Buscar por cliente, imóvel ou unidade..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
          >
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[160px] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="progress">Em andamento</SelectItem>
                  <SelectItem value="complete">Concluídos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterProperty} onValueChange={setFilterProperty}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3 text-muted-foreground" />
                    <SelectValue placeholder="Empreendimento" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os imóveis</SelectItem>
                  <SelectItem value="Edifício Aurora">Edifício Aurora</SelectItem>
                  <SelectItem value="Residencial Bosque Verde">Residencial Bosque Verde</SelectItem>
                  <SelectItem value="Condomínio Monte Azul">Condomínio Monte Azul</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterTechnician} onValueChange={setFilterTechnician}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <SelectValue placeholder="Técnico" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os técnicos</SelectItem>
                  <SelectItem value="Carlos Andrade">Carlos Andrade</SelectItem>
                  <SelectItem value="Luiza Mendes">Luiza Mendes</SelectItem>
                  <SelectItem value="Roberto Santos">Roberto Santos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterChecklist} onValueChange={setFilterChecklist}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-lg">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-3 w-3 text-muted-foreground" />
                    <SelectValue placeholder="Checklist" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os checklists</SelectItem>
                  <SelectItem value="checklist1">Entrega de Apartamento</SelectItem>
                  <SelectItem value="checklist2">Verificação Hidráulica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FilterBar>

          {viewMode === "calendar" ? (
            <InspectionCalendar inspections={filteredInspections} />
          ) : (
            <DataView
              items={filteredInspections}
              itemsPerPage={6}
              gridClassName="grid-cols-1 xl:grid-cols-2"
              renderGrid={(inspection) => (
                <Card 
                  key={inspection.id} 
                  className="card-standard overflow-hidden card-hover-effect border-none bg-card/50 backdrop-blur-sm"
                >
                  <CardContent className="p-0">
                    <InspectionItem inspection={inspection} onUpdate={loadData} />
                  </CardContent>
                </Card>
              )}
              emptyState={{
                title: "Nenhuma vistoria encontrada",
                description: "Nenhum resultado corresponde aos filtros aplicados no momento.",
                action: {
                  label: "Limpar filtros",
                  onClick: clearFilters
                }
              }}
            />
          )}
        </TabsContent>


        <TabsContent value="analytics" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-h4">Distribuição por Status</CardTitle>
                <CardDescription>Resumo atual do pipeline de vistorias</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(inspectionService.getStatsByStatus()).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.entries(inspectionService.getStatsByStatus()).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#F59E0B', '#3B82F6', '#10B981', '#EF4444'][index % 4]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36}/>
                    <ReTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-h4">Vistorias por Técnico</CardTitle>
                <CardDescription>Carga de trabalho por profissional</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={Object.entries(inspectionService.getStatsByTechnician()).map(([name, value]) => ({ name, value }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <ReTooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                  </ReBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-standard lg:col-span-2 border-none bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-h4">Tipos de Vistoria</CardTitle>
                <CardDescription>Distribuição por modalidade de serviço</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={Object.entries(inspectionService.getStatsByType()).map(([name, value]) => ({ 
                      name: name === 'keyDelivery' ? 'Entrega de Chaves' : name === 'technicalInspection' ? 'Vistoria Técnica' : 'Pós-Obra', 
                      value 
                    }))}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ReTooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                  </ReBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <AuditLogViewer entityType="inspection" title="Logs de Auditoria - Vistorias" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
