
import { useState } from "react";
import { 
  ClipboardCheck, 
  Calendar as CalendarIcon, 
  History, 
  Download,
  LayoutGrid,
  BarChart
} from "lucide-react";

import { InspectionItem } from "@/components/Inspection/InspectionItem";
import { PageTemplate } from "@/components/Layout/PageTemplate";
import { ScheduleInspectionDialog } from "@/components/Inspection/ScheduleInspectionDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLogViewer } from "@/components/Admin/AuditLogViewer";
import { Inspection } from "@/types/inspection";
import { InspectionCalendar } from "@/components/Inspection/InspectionCalendar";
import { DataView } from "@/components/Shared/DataView";
import { useInspections, useConfirm } from "@/hooks";
import { Button } from "@/components/ui/button";
import { DataViewMode } from "@/types";
import { InspectionStats } from "@/components/Inspection/InspectionStats";
import { InspectionFilters } from "@/components/Inspection/InspectionFilters";
import { InspectionAnalytics } from "@/components/Inspection/InspectionAnalytics";

export default function Inspections() {
  const {
    filteredInspections,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    stats,
    analyticsStats,
    properties,
    loadData,
    clearFilters,
    handleExport,
    updateStatus
  } = useInspections();

  const [activeTab, setActiveTab] = useState("list");
  const [viewMode, setViewMode] = useState<DataViewMode>("grid");
  const { confirm } = useConfirm();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const actions = (
    <div className="flex flex-wrap items-center gap-3">
      <Button 
        variant="outline"
        onClick={handleExport}
        className="rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
      >
        <Download className="mr-2 h-4 w-4" /> Inteligência de Dados
      </Button>
      <Button 
        variant={viewMode === "calendar" ? "default" : "outline"}
        onClick={() => setViewMode(viewMode === "grid" ? "calendar" : "grid")}
        className="rounded-xl h-11 px-5 font-bold border-primary/20 transition-all active:scale-95"
      >
        {viewMode === "calendar" ? <LayoutGrid className="mr-2 h-4 w-4" /> : <CalendarIcon className="mr-2 h-4 w-4" />}
        {viewMode === "calendar" ? "Módulo de Lista" : "Cronograma Estratégico"}
      </Button>
      <ScheduleInspectionDialog onSuccess={loadData} />
    </div>
  );

  return (
    <PageTemplate
      title="Vistorias e Entregas Técnicas"
      description="Controle absoluto do ciclo de vida das vistorias, garantindo conformidade e excelência na entrega das chaves."
      icon={ClipboardCheck}
      actions={actions}
    >
      <InspectionStats stats={stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex w-full max-w-lg overflow-x-auto no-scrollbar bg-muted/50 p-1 rounded-xl h-auto min-h-10">
          <TabsTrigger value="list" className="gap-2 rounded-lg py-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ClipboardCheck className="h-4 w-4" /> Vistorias
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 rounded-lg py-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart className="h-4 w-4" /> Estatísticas
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2 rounded-lg py-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <History className="h-4 w-4" /> AuditLog
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <InspectionFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters as any}
            onFilterChange={handleFilterChange}
            properties={properties}
          />


          <DataView<Inspection>
            items={filteredInspections}
            viewMode={viewMode}
            itemsPerPage={6}
            gridClassName="grid-cols-1 xl:grid-cols-2"
            renderGrid={(inspection) => (
              <Card key={inspection.id} className="card-standard overflow-hidden card-hover-effect border-none bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  <InspectionItem 
                    inspection={inspection} 
                    onUpdate={loadData} 
                    onCancel={async () => {
                      if (await confirm({
                        title: "Cancelar Vistoria",
                        description: `Deseja realmente cancelar a vistoria da unidade ${inspection.unit} do empreendimento ${inspection.property}?`,
                        confirmLabel: "Cancelar Vistoria",
                      })) {
                        await updateStatus(inspection.id, "cancelled");
                      }
                    }}
                  />
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
          <InspectionAnalytics 
            statusStats={analyticsStats.status}
            technicianStats={analyticsStats.technician}
          />
        </TabsContent>

        <TabsContent value="logs" className="animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <AuditLogViewer entityType="inspection" title="Logs de Auditoria - Vistorias" />
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}

