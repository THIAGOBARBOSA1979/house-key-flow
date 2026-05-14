import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Calendar as CalendarIcon, ListFilter, SearchX, History, Clock, CheckCircle2, AlertCircle, BarChart, LayoutGrid } from "lucide-react";
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

export default function Inspections() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("list");
  const [inspections, setInspections] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  useEffect(() => {
    setInspections(inspectionService.getAll());
  }, []);

  const filteredInspections = useMemo(() => {
    return inspections.filter(inspection => {
      const matchesSearch = inspection.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inspection.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || inspection.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [inspections, searchTerm, filterStatus]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
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
        <div className="flex gap-2">
          <Button 
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
          >
            {viewMode === "calendar" ? <LayoutGrid className="mr-2 h-4 w-4" /> : <CalendarIcon className="mr-2 h-4 w-4" />}
            {viewMode === "calendar" ? "Lista" : "Calendário"}
          </Button>
          <ScheduleInspectionDialog onSuccess={() => setInspections(inspectionService.getAll())} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-status-pending/5 border-status-pending/20 shadow-sm transition-all hover:bg-status-pending/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-status-pending/10 rounded-lg text-status-pending">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-status-complete/5 border-status-complete/20 shadow-sm transition-all hover:bg-status-complete/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-status-complete/10 rounded-lg text-status-complete">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-status-critical/5 border-status-critical/20 shadow-sm transition-all hover:bg-status-critical/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-status-critical/10 rounded-lg text-status-critical">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
              <p className="text-2xl font-bold text-status-critical">{stats.delayed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3 bg-muted/50 p-1">
          <TabsTrigger value="list" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Vistorias
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <History className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <FilterBar
            searchPlaceholder="Buscar agendamentos..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
          >
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
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
            filteredInspections.length > 0 ? (
              <div className="grid gap-4">
                {filteredInspections.map((inspection) => (
                  <Card 
                    key={inspection.id} 
                    className="overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30"
                  >
                    <CardContent className="p-0">
                      <InspectionItem inspection={inspection} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-1">Nenhuma vistoria encontrada</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Nenhum resultado corresponde aos filtros aplicados.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>
            )
          )}
        </TabsContent>


        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição por Status</CardTitle>
                <CardDescription>Resumo atual do pipeline de vistorias</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground italic">
                Gráfico de distribuição (Mock)
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evolução Mensal</CardTitle>
                <CardDescription>Volume de vistorias concluídas por mês</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground italic">
                Gráfico de tendência (Mock)
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <AuditLogViewer entityType="inspection" title="Logs de Auditoria - Vistorias" />
        </TabsContent>
      </Tabs>
    </div>
  );
}