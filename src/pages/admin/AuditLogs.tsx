
import { Activity, Shield, Download, Trash2, Filter, Search } from "lucide-react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Button } from "@/components/ui/button";
import { AuditLogViewer } from "@/components/Admin/AuditLogViewer";
import { useToast } from "@/hooks/use-toast";
import { exportService } from "@/services/ExportService";
import { auditLogService } from "@/services/AuditLogService";

const AuditLogs = () => {
  const { toast } = useToast();

  const handleExport = () => {
    const logs = auditLogService.getAllLogs();
    exportService.exportToCSV(logs, "logs_auditoria_sistema");
    toast({
      title: "Exportação concluída",
      description: "O arquivo CSV foi gerado com sucesso.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        icon={Shield}
        title="Logs de Auditoria"
        description="Rastreabilidade completa de todas as ações realizadas no sistema."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 font-bold" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6">
        <AuditLogViewer title="Histórico Global do Sistema" />
      </div>
    </div>
  );
};

export default AuditLogs;
