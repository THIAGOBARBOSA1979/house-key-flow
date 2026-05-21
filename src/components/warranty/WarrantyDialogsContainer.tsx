import { WarrantyRequestFlow } from "@/types/warrantyFlow";
import { WarrantyDetailsDialog } from "./WarrantyDetailsDialog";
import { TechnicalReportDialog } from "./TechnicalReportDialog";
import { WarrantyStage } from "@/types/warrantyFlow";

interface WarrantyDialogsContainerProps {
  selectedRequest: WarrantyRequestFlow | null;
  setSelectedRequestId: (id: string | null) => void;
  reportDialogOpen: boolean;
  setReportDialogOpen: (open: boolean) => void;
  onStatusChange: (requestId: string, newStage: WarrantyStage, notes?: string) => Promise<any>;
  onTogglePause: (requestId: string, isPaused: boolean, reason: string) => any;
  onAssignTech: (requestId: string, techId: string, techName: string) => any;
}

export const WarrantyDialogsContainer = ({
  selectedRequest,
  setSelectedRequestId,
  reportDialogOpen,
  setReportDialogOpen,
  onStatusChange,
  onTogglePause,
  onAssignTech
}: WarrantyDialogsContainerProps) => {
  return (
    <>
      <WarrantyDetailsDialog 
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequestId(null)}
        onStatusChange={onStatusChange}
        onTogglePause={onTogglePause}
        onAssignTech={onAssignTech}
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
    </>
  );
};
