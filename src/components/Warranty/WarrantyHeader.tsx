import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Plus, 
  ChevronDown,
  Download,
  FileText,
  BarChart3,
  Mail,
  Settings,
  Filter,
  Bell,
  Calendar,
  Archive,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { PageHeader } from "@/components/Layout/PageHeader";
import { exportService } from "@/services";
import { warrantyFlowService } from "@/services";

interface WarrantyHeaderProps {
  onExportData: () => void;
}

export const WarrantyHeader = ({ onExportData }: WarrantyHeaderProps) => {
  const { toast } = useToast();

  return (
    <PageHeader
      icon={ShieldCheck}
      title="Gestão de Garantias"
      description="Fluxo completo de assistência técnica, controle de SLA e custos operacionais."
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
          <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
          Nova Solicitação
        </Button>

        {/* Relatórios */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 px-5 rounded-xl font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95">
              <BarChart3 className="mr-2 h-4 w-4" />
              Relatórios e BI
              <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-sem-xl border-none animate-in zoom-in-95">
            <DropdownMenuLabel className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Exportar Dados</DropdownMenuLabel>
            <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => exportService.exportToCSV(warrantyFlowService.getAllRequests(), 'garantias_a2')}>
              <Download className="mr-3 h-4 w-4 opacity-50" /> Exportar CSV
            </DropdownMenuItem>
            <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => toast({ title: "BI em processamento", description: "O dashboard executivo está sendo gerado." })}>
              <FileText className="mr-3 h-4 w-4 opacity-50" /> Relatório Executivo
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuLabel className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Agendamentos</DropdownMenuLabel>
            <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => toast({ title: "Enviando relatório", description: "O relatório semanal de SLA será enviado por e-mail." })}>
              <Mail className="mr-3 h-4 w-4 opacity-50" /> SLA Semanal por E-mail
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Ações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 px-5 rounded-xl font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
              <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-sem-xl border-none animate-in zoom-in-95">
            <DropdownMenuLabel className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Regras de Negócio</DropdownMenuLabel>
            <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => toast({ title: "Configuração de Alertas", description: "Módulo de gatilhos automáticos de SLA." })}>
              <Bell className="mr-3 h-4 w-4 opacity-50" /> Gatilhos de Alerta
            </DropdownMenuItem>
            <DropdownMenuItem className="py-3 px-4 font-bold cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary" onClick={() => toast({ title: "Manutenção de Prazos", description: "Ajuste os prazos legais de garantia globalmente." })}>
              <Calendar className="mr-3 h-4 w-4 opacity-50" /> Prazos Globais
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem className="py-3 px-4 font-black text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer rounded-xl" onClick={() => toast({ title: "Ação restrita", description: "Apenas super-admins podem realizar limpeza de dados." })}>
              <Trash2 className="mr-3 h-4 w-4 opacity-50" /> Limpeza de Base
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </PageHeader>
  );
};
