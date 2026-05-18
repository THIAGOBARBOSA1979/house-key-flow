import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Kanban, BarChart3, Settings, History } from "lucide-react";
import { WarrantyKanban } from "@/components/Warranty/Kanban/WarrantyKanban";
import { WarrantyMetricsDashboard } from "@/components/Warranty/Dashboard/WarrantyMetricsDashboard";
import { SLAConfigurationPanel } from "@/components/Warranty/SLA/SLAConfigurationPanel";
import { AuditLogViewer } from "@/components/Admin/AuditLogViewer";
import { WarrantyHeader } from "@/components/Warranty/WarrantyHeader";
import { WarrantyDetailsDialog } from "@/components/Warranty/WarrantyDetailsDialog";
import { useWarranty } from "@/hooks/useWarranty";
import { TechnicalReportDialog } from "@/components/Warranty/TechnicalReportDialog";

const Warranty = () => {
  const [activeTab, setActiveTab] = useState("kanban");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  
  const { 
    selectedRequest, 
    setSelectedRequestId, 
    changeStatus, 
    togglePause, 
    assignTechnician, 
    exportData 
  } = useWarranty();

  const handleSelectRequest = (request: any) => {
    setSelectedRequestId(request.id);
  };

  return (
    <div className="space-y-6">
      <WarrantyHeader onExportData={exportData} />
      
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
        
        <TabsContent value="kanban" className="space-y-4">
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
          isOpen={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          request={selectedRequest}
        />
      )}
    </div>
  );
};

export default Warranty;
