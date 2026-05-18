import { useState } from "react";
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
  Building,
  List
} from "lucide-react";
import { InspectionItem } from "@/components/Inspection/InspectionItem";
import { PageTemplate } from "@/components/Layout/PageTemplate";
import { FilterBar } from "@/components/Layout/FilterBar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScheduleInspectionDialog } from "@/components/Inspection/ScheduleInspectionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLogViewer } from "@/components/Admin/AuditLogViewer";
import { Inspection } from "@/types/inspection";
import { InspectionCalendar } from "@/components/Inspection/InspectionCalendar";
import { StatsCard } from "@/components/shared/StatsCard";
import { DataView } from "@/components/shared/DataView";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
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
import { useInspections } from "@/hooks/useInspections";
import { Button } from "@/components/ui/button";
import { DataViewMode } from "@/components/shared/DataView";
import { inspectionService } from "@/services/InspectionService";



export default function Inspections() {
  const {
    filteredInspections,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterProperty,
    setFilterProperty,
    stats,
    loadData,
    clearFilters,
    handleExport
  } = useInspections();

  const [activeTab, setActiveTab] = useState("list");
  const [viewMode, setViewMode] = useState<DataViewMode>("grid");

  const actions = (
    <div className="flex flex-wrap items-center gap-3">
      <Button 
        variant="outline"
        onClick={handleExport}
        className="rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
      >
        <Download className="mr-2 h-4 w-4" /> Exportar Dados
      </Button>
      <Button 
        variant={viewMode === "calendar" ? "default" : "outline"}
        onClick={() => setViewMode(viewMode === "grid" ? "calendar" : "grid")}
        className="rounded-xl h-11 px-5 font-bold border-primary/20 transition-all active:scale-95"
      >
        {viewMode === "calendar" ? <LayoutGrid className="mr-2 h-4 w-4" /> : <CalendarIcon className="mr-2 h-4 w-4" />}
        {viewMode === "calendar" ? "Visualizar Lista" : "Visualizar Calendário"}
      </Button>
      <ScheduleInspectionDialog onSuccess={loadData} />
    </div>
  );

  return (
    <PageTemplate
      title="Vistorias e Entregas"
      description="Gestão do ciclo de vida de vistorias, desde a técnica até a entrega das chaves."
      icon={ClipboardCheck}
      actions={actions}
    >
      <ResponsiveGrid columns={3} gap="layout">
        <StatsCard label="Vistorias Pendentes" value={stats.pending} icon={Clock} variant="pending" description="Aguardando atendimento" className="rounded-3xl" />
        <StatsCard label="Vistorias Concluídas" value={stats.completed} icon={CheckCircle2} variant="complete" description="Total de unidades entregues" className="rounded-3xl" />
        <StatsCard label="Atrasadas / Urgentes" value={stats.delayed} icon={AlertCircle} variant="critical" description="Fora do prazo acordado" className="rounded-3xl" />
      </ResponsiveGrid>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex w-full max-w-lg overflow-x-auto no-scrollbar bg-muted/50 p-1 rounded-xl h-auto min-h-10">
          <TabsTrigger value="list" className="gap-2 rounded-lg py-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ClipboardCheck className="h-4 w-4" /> Vistorias
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 rounded-lg py-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart className="h-4 w-4" /> Estatísticas
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2 rounded-lg py-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <History className="h-4 w-4" /> Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <FilterBar searchPlaceholder="Buscar..." searchValue={searchTerm} onSearchChange={setSearchTerm}>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[160px] rounded-lg">
                  <div className="flex items-center gap-2"><Filter className="h-3 w-3 text-muted-foreground" /><SelectValue placeholder="Status" /></div>
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
                  <div className="flex items-center gap-2"><Building className="h-3 w-3 text-muted-foreground" /><SelectValue placeholder="Empreendimento" /></div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os imóveis</SelectItem>
                  <SelectItem value="Edifício Aurora">Edifício Aurora</SelectItem>
                  <SelectItem value="Residencial Bosque Verde">Residencial Bosque Verde</SelectItem>
                  <SelectItem value="Condomínio Monte Azul">Condomínio Monte Azul</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FilterBar>

          <DataView<Inspection>
            items={filteredInspections}
            viewMode={viewMode}
            itemsPerPage={6}
            gridClassName="grid-cols-1 xl:grid-cols-2"
            renderGrid={(inspection) => (
              <Card key={inspection.id} className="card-standard overflow-hidden card-hover-effect border-none bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  <InspectionItem inspection={inspection} onUpdate={loadData} />
                </CardContent>
              </Card>
            )}
            renderCalendar={(inspections) => (
              <InspectionCalendar inspections={inspections} />
            )}
            emptyState={{
              title: "Nenhuma vistoria encontrada",
              description: "Ajuste os filtros para encontrar o que procura.",
              action: { label: "Limpar filtros", onClick: clearFilters }
            }}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
              <CardHeader><CardTitle className="text-h4">Distribuição por Status</CardTitle></CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(inspectionService.getStatsByStatus()).map(([name, value]) => ({ name, value }))}
                      cx="50%" cy="50%" outerRadius={100} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.entries(inspectionService.getStatsByStatus()).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#F59E0B', '#3B82F6', '#10B981', '#EF4444'][index % 4]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36}/><ReTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
              <CardHeader><CardTitle className="text-h4">Vistorias por Técnico</CardTitle></CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={Object.entries(inspectionService.getStatsByTechnician()).map(([name, value]) => ({ name, value }))}
                    layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <XAxis type="number" hide /><YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} /><ReTooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
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
    </PageTemplate>
  );
}
