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
  Building
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
      
      return matchesSearch && matchesStatus && matchesTech && matchesProperty;
    });
  }, [inspections, searchTerm, filterStatus, filterTechnician, filterProperty]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterTechnician("all");
    setFilterProperty("all");
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
          <TabsTrigger value="list" className="gap-2 rounded-lg py-2">
            <ClipboardCheck className="h-4 w-4" />
            Vistorias
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 rounded-lg py-2">
            <BarChart className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2 rounded-lg py-2">
            <History className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <FilterBar
            searchPlaceholder="Buscar agendamentos..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
          >
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] rounded-lg">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="progress">Em andamento</SelectItem>
                <SelectItem value="complete">Concluídos</SelectItem>
              </SelectContent>
            </Select>
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
                    <InspectionItem inspection={inspection} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-standard bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-h4">Distribuição por Status</CardTitle>
                <CardDescription>Resumo atual do pipeline de vistorias</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground italic">
                Gráfico de distribuição (Mock)
              </CardContent>
            </Card>
            <Card className="card-standard bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-h4">Evolução Mensal</CardTitle>
                <CardDescription>Volume de vistorias concluídas por mês</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground italic">
                Gráfico de tendência (Mock)
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
