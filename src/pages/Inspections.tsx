import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Calendar as CalendarIcon, ListFilter, SearchX, History, Clock, CheckCircle2, AlertCircle, BarChart } from "lucide-react";
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

const inspections = [
  { id: "1", property: "Edifício Aurora", unit: "101", client: "João Silva", scheduledDate: new Date(), status: "pending" as const },
  { id: "2", property: "Residencial Bosque Verde", unit: "302", client: "Maria Santos", scheduledDate: new Date(), status: "progress" as const },
  { id: "3", property: "Condomínio Monte Azul", unit: "505", client: "Pedro Alves", scheduledDate: new Date(Date.now() - 86400000), status: "pending" as const }, // Ontem
  { id: "4", property: "Edifício Aurora", unit: "204", client: "Ana Beatriz", scheduledDate: new Date(), status: "complete" as const },
];

export default function Inspections() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("list");

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || inspection.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        title="Vistorias"
        description="Gerenciamento de vistorias e entregas de unidades"
      >
        <Button variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Calendário
        </Button>
        <ScheduleInspectionDialog />
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-bold">85</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/50 border-red-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
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
            <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" />
              Mais filtros
            </Button>
          </FilterBar>

          {filteredInspections.length > 0 ? (
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