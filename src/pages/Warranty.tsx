import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Kanban, BarChart3, Settings, History, Loader2, AlertCircle } from "lucide-react";
import { WarrantyKanban } from "@/components/Warranty/Kanban/WarrantyKanban";
import { WarrantyMetricsDashboard } from "@/components/Warranty/Dashboard/WarrantyMetricsDashboard";
import { SLAConfigurationPanel } from "@/components/Warranty/SLA/SLAConfigurationPanel";
import { AuditLogViewer } from "@/components/Admin/AuditLogViewer";
import { WarrantyDetailsDialog } from "@/components/Warranty/WarrantyDetailsDialog";
import { useWarranty } from "@/hooks/useWarranty";
import { TechnicalReportDialog } from "@/components/Warranty/TechnicalReportDialog";
import { WarrantyRequestFlow } from "@/types/warrantyFlow";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageTemplate } from "@/components/Layout/PageTemplate";
import { Download } from "lucide-react";

const Warranty = () => {
  const [activeTab, setActiveTab] = useState("kanban");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  
  const { 
    selectedRequest, 
    setSelectedRequestId, 
    changeStatus, 
    togglePause, 
    assignTechnician, 
    exportData,
    isLoading,
    error,
    refresh
  } = useWarranty();

  const handleSelectRequest = (request: WarrantyRequestFlow) => {
    setSelectedRequestId(request.id);
  };

  const actions = (
    <Button variant="outline" size="sm" onClick={exportData} className="h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95">
      <Download className="mr-2 h-4 w-4" /> Exportar Dados
    </Button>
  );

  return (
    <PageTemplate
      title="Gestão de Garantias"
      description="Fluxo completo de assistência técnica, controle de SLA e métricas de desempenho."
      actions={actions}
    >
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar garantias</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={refresh} className="ml-4">
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex w-full max-w-lg overflow-x-auto no-scrollbar bg-muted/50 p-1 rounded-xl h-auto min-h-10">
          <TabsTrigger value="kanban" className="gap-2 rounded-lg py-2">
            <Kanban className="h-4 w-4" />
            <span className="hidden sm:inline">Kanban</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2 rounded-lg py-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Métricas</span>
          </TabsTrigger>
          <TabsTrigger value="sla" className="gap-2 rounded-lg py-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">SLA</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2 rounded-lg py-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="kanban" className="space-y-4 relative">
          {isLoading && !selectedRequest && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <WarrantyKanban onSelectRequest={handleSelectRequest} />
        </TabsContent>
        
        <TabsContent value="dashboard">
          <WarrantyMetricsDashboard />
        </TabsContent>
        
        <TabsContent value="sla">
          <SLAConfigurationPanel />
        </TabsContent>

        <TabsContent value="logs">
          <AuditLogViewer entityType="warranty" title="Logs de Auditoria - Garantias" />
        </TabsContent>
      </Tabs>

      <WarrantyDetailsDialog 
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequestId(null)}
        onStatusChange={changeStatus}
        onTogglePause={togglePause}
        onAssignTech={assignTechnician}
        onAddProblem={() => {}}
        onGenerateReport={() => setReportDialogOpen(true)}
      />

      {selectedRequest && (
        <TechnicalReportDialog 
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          request={selectedRequest}
        />
      )}
    </PageTemplate>
  );
};

export default Warranty;

