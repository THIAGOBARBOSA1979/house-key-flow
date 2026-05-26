import { useState } from "react";
import { Activity, Shield, Download, Trash2, Filter, Search, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
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
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <PageHeader
            icon={Shield}
            title="Logs de Auditoria"
            description="Rastreabilidade completa e imutável de todas as ações administrativas e de clientes."
            showBreadcrumbs={true}
          >
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl h-11 px-5 font-bold border-primary/20 hover:bg-primary/5 transition-all" onClick={handleExport} disabled={isExporting}>
                {isExporting ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Exportar Auditoria (CSV)
              </Button>
            </div>
          </PageHeader>
        </div>
        
        <Card className="lg:w-80 rounded-[2rem] border-none bg-primary/5 shadow-inner p-6 flex flex-col justify-center gap-2">
           <div className="flex items-center gap-3">
             <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Monitoramento Ativo</span>
           </div>
           <p className="text-2xl font-black text-foreground tracking-tighter">Real-Time</p>
           <p className="text-[10px] text-muted-foreground font-bold uppercase">Sincronização com Ledger Digital</p>
        </Card>
      </div>


      <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-bottom-4 duration-700">
        <AuditLogViewer 
          title="Rastreabilidade Global Estratégica" 
          className="rounded-card shadow-sem-xl border-none bg-card/40 backdrop-blur-md overflow-hidden" 
        />
      </div>






      <div className="p-6 bg-muted/5 rounded-[2rem] border border-border/10 flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm shrink-0">
          <Activity size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground mb-1">Integridade de Dados</p>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Todos os logs são assinados digitalmente e armazenados em infraestrutura de alta disponibilidade. 
            Este registro constitui a prova técnica imutável de todas as transações de dados na governança A2.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
