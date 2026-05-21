import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { WarrantyKanban } from "@/components/warranty/Kanban/WarrantyKanban";
import { WarrantyMetricsDashboard } from "@/components/warranty/Dashboard/WarrantyMetricsDashboard";
import { SLAConfigurationPanel } from "@/components/warranty/SLA/SLAConfigurationPanel";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { useWarranty } from "@/hooks";
import { WarrantyRequestFlow } from "@/types/warrantyFlow";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { WarrantyTabsHeader } from "@/components/warranty/WarrantyTabsHeader";
import { WarrantyPageActions } from "@/components/warranty/WarrantyPageActions";
import { WarrantyDialogsContainer } from "@/components/warranty/WarrantyDialogsContainer";
import { ErrorView } from "@/components/shared/ErrorView";

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
    error: warrantyError,
    refresh
  } = useWarranty();

  const handleSelectRequest = (request: WarrantyRequestFlow) => {
    setSelectedRequestId(request.id);
  };

  return (
    <PageTemplate
      title="Engenharia de Diagnóstico & Assistência"
      description="Governança técnica do pós-venda: controle de SLAs, fluxos de assistência e conformidade com normas ABNT."
      actions={<WarrantyPageActions onExport={exportData} />}
    >

      {warrantyError && (
        <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
           <ErrorView 
             message={(warrantyError as any)?.message || "Ocorreu um erro técnico no processamento dos protocolos."} 
             onRetry={refresh} 
           />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <WarrantyTabsHeader />
        
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

      <WarrantyDialogsContainer 
        selectedRequest={selectedRequest}
        setSelectedRequestId={setSelectedRequestId}
        reportDialogOpen={reportDialogOpen}
        setReportDialogOpen={setReportDialogOpen}
        onStatusChange={changeStatus}
        onTogglePause={togglePause}
        onAssignTech={assignTechnician}
      />
    </PageTemplate>
  );
};

export default Warranty;
