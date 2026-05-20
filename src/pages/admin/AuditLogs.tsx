import { useState } from "react";
import { Activity, Shield, Download, Trash2, Filter, Search, RotateCw } from "lucide-react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Button } from "@/components/ui/button";
import { AuditLogViewer } from "@/components/Admin/AuditLogViewer";
import { useToast } from "@/hooks";
import { exportService } from "@/services";
import { auditLogService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";

const AuditLogs = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const logs = auditLogService.getAllLogs();
      exportService.exportToCSV(logs, "logs_auditoria_sistema");
      toast({
        title: "Exportação concluída",
        description: "O arquivo CSV foi gerado com sucesso.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <PageHeader
        icon={Shield}
        title="Logs de Auditoria"
        description="Rastreabilidade completa e imutável de todas as ações administrativas e de clientes."
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 transition-all" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Exportar Auditoria (CSV)
          </Button>
        </div>
      </PageHeader>


      <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-bottom-4 duration-700">
        <AuditLogViewer 
          title="Rastreabilidade Global Estratégica" 
          className="rounded-[2.5rem] shadow-sem-xl border-none bg-card/40 backdrop-blur-md overflow-hidden" 
        />
      </div>






    </div>
  );
};

export default AuditLogs;
