
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarrantyKanban } from "@/components/Warranty/Kanban/WarrantyKanban";
import { WarrantyMetricsDashboard } from "@/components/Warranty/Dashboard/WarrantyMetricsDashboard";
import { SLAConfigurationPanel } from "@/components/Warranty/SLA/SLAConfigurationPanel";
import { WarrantyHeader } from "@/components/Warranty/WarrantyHeader";
import { WarrantyRequestFlow } from "@/types/warrantyFlow";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { WarrantyRequestTimeline } from "@/components/Warranty/ClientTimeline/WarrantyRequestTimeline";
import { AuditLogViewer } from "@/components/Admin/AuditLogViewer";
import { Kanban, BarChart3, Settings } from "lucide-react";

const Warranty = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("kanban");
  const [selectedRequest, setSelectedRequest] = useState<WarrantyRequestFlow | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados serão enviados para seu e-mail quando estiverem prontos.",
    });
  };

  const handleSelectRequest = (request: WarrantyRequestFlow) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <WarrantyHeader onExportData={handleExportData} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="kanban" className="gap-2">
            <Kanban className="h-4 w-4" />
            <span className="hidden sm:inline">Kanban</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Métricas</span>
          </TabsTrigger>
          <TabsTrigger value="sla" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">SLA</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="kanban" className="space-y-4">
          <WarrantyKanban onSelectRequest={handleSelectRequest} />
        </TabsContent>
        
        <TabsContent value="dashboard" className="space-y-4">
          <WarrantyMetricsDashboard />
        </TabsContent>
        
        <TabsContent value="sla" className="space-y-4">
          <SLAConfigurationPanel />
        </TabsContent>
      </Tabs>

      {/* Request Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <Tabs defaultValue="timeline" className="space-y-4">
              <TabsList>
                <TabsTrigger value="timeline">Acompanhamento</TabsTrigger>
                <TabsTrigger value="logs">Histórico/Logs</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline">
                <WarrantyRequestTimeline request={selectedRequest} />
              </TabsContent>
              <TabsContent value="logs">
                <AuditLogViewer 
                  entityType="warranty" 
                  entityId={selectedRequest.id} 
                  title="Logs de Auditoria" 
                  compact 
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Warranty;
