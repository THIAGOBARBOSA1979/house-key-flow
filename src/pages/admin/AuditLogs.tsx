
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
    <div className="space-y-8 animate-fade-in pb-10">
      <PageHeader
        icon={Shield}
        title="Logs de Auditoria"
        description="Rastreabilidade completa e imutável de todas as ações administrativas e de clientes."
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Auditoria (CSV)
          </Button>
        </div>
      </PageHeader>


      <div className="grid grid-cols-1 gap-8">
        <AuditLogViewer title="Histórico Global" className="rounded-3xl shadow-sem-xl border-none bg-card/40 backdrop-blur-md overflow-hidden" />
      </div>

    </div>
  );
};

export default AuditLogs;
