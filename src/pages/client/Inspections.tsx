import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Calendar, ClipboardCheck, User, MapPin, List, CheckCircle, Clock, 
  FileText, Lock, Info, TrendingUp, AlertTriangle, Activity, 
  History, ArrowRight, ChevronRight, MessageSquare, ShieldCheck, PenTool
} from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { safeFormat } from "@/lib/utils";
import { StartInspectionDialog } from "@/components/Inspection/StartInspectionDialog";
import { ScheduleInspectionDialog } from "@/components/Inspection/ScheduleInspectionDialog";
import { RescheduleInspectionDialog } from "@/components/Inspection/RescheduleInspectionDialog";
import { DocumentPreviewDialog } from "@/components/Documents/DocumentPreviewDialog";
import { documentService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { FeatureGate, GatedButton } from "@/components/ClientFlow/FeatureGate";
import { useClientStage } from "@/hooks/useClientStage";
import { InspectionAcceptance } from "@/components/Inspection/InspectionAcceptance";
import { useAuth } from "@/contexts/AuthContext";
import { inspectionService, Inspection } from "@/services";
import { ClientTimeline, TimelineStep } from "@/components/client/ClientTimeline";
import { cn } from "@/lib/utils";

export default function ClientInspections() {
  const { user } = useAuth();
  const clientId = user?.id || "client-1";
  const { stage } = useClientStage(clientId);
  const { toast } = useToast();
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [inspections, setInspections] = useState<any[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  const loadInspections = () => {
    const raw = inspectionService.getAll().filter(i => i.client === (user?.name || "João Silva"));
    setInspections(raw.map(i => ({ ...i, title: i.type === 'keyDelivery' ? 'Entrega' : 'Vistoria', scheduledDate: i.date })));
    if (raw.length > 0 && !selectedInspection) setSelectedInspection(raw[0].id);
  };

  useEffect(() => { loadInspections(); }, [user]);

  const inspection = useMemo(() => selectedInspection ? inspections.find(i => i.id === selectedInspection) : null, [selectedInspection, inspections]);

  const handleViewPdf = () => {
    if (selectedInspection) {
      const report = inspectionService.getReport(selectedInspection);
      if (report) {
        const generated = documentService.generateDocument('inspection', {});
        setPreviewContent(generated.template || "");
        setIsPreviewOpen(true);
      }
    }
  };

  const handleAcceptInspection = (id: string, data: any) => {
    inspectionService.signAcceptance(id, clientId, data);
    loadInspections();
    toast({ title: "Vistoria aceita" });
  };

  const steps: TimelineStep[] = [
    { id: '1', title: 'Agendamento', description: 'Data e hora', status: 'completed' },
    { id: '2', title: 'Vistoria', description: 'Campo', status: inspection?.status === 'complete' ? 'completed' : 'current' }
  ];

  return (
    <div className="space-y-layout-gap pb-20 animate-in fade-in duration-slow">
      <DocumentPreviewDialog 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        generatedContent={previewContent} 
        document={{ title: "Relatório", type: "auto" } as any} 
      />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-primary">Vistorias</h1>
      </div>

      <ResponsiveGrid columns={4} gap="layout">
        <StatsCard label="Realizadas" value={inspections.filter(i => i.status === 'complete').length} icon={CheckCircle} variant="complete" />
      </ResponsiveGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-layout-gap mt-6">
        <Card className="rounded-[2rem] bg-white"><CardContent className="p-8"><ClientTimeline steps={steps} /></CardContent></Card>
        <div className="lg:col-span-2 space-y-layout-gap">
          {inspection && (
            <Card className="rounded-[2rem]">
              <CardHeader><CardTitle>{inspection.title}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleViewPdf}><FileText className="mr-2" />Ver Relatório</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
