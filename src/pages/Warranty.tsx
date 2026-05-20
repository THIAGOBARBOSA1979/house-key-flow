import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { WarrantyKanban } from "@/components/Warranty/Kanban/WarrantyKanban";
import { WarrantyMetricsDashboard } from "@/components/Warranty/Dashboard/WarrantyMetricsDashboard";
import { SLAConfigurationPanel } from "@/components/Warranty/SLA/SLAConfigurationPanel";
import { AuditLogViewer } from "@/components/Admin/AuditLogViewer";
import { useWarranty } from "@/hooks";
import { WarrantyRequestFlow } from "@/types/warrantyFlow";
import { PageTemplate } from "@/components/Layout/PageTemplate";
import { WarrantyTabsHeader } from "@/components/Warranty/WarrantyTabsHeader";
import { WarrantyErrorAlert } from "@/components/Warranty/WarrantyErrorAlert";
import { WarrantyPageActions } from "@/components/Warranty/WarrantyPageActions";
import { WarrantyDialogsContainer } from "@/components/Warranty/WarrantyDialogsContainer";

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
    // error property removed from useWarranty
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

      {/* Error alert removed as error state is now handled globally in useService or not exposed */}

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


