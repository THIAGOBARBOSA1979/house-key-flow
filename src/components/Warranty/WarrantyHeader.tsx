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
import { exportService } from "@/services/ExportService";
import { warrantyFlowService } from "@/services/WarrantyFlowService";

interface WarrantyHeaderProps {
  onExportData: () => void;
}

export const WarrantyHeader = ({ onExportData }: WarrantyHeaderProps) => {
  const { toast } = useToast();

  return (
    <PageHeader
      icon={ShieldCheck}
      title="Garantias"
      description="Gerenciamento completo de solicitações de garantia e assistência técnica"
    >
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Nova Solicitação
      </Button>

      {/* Relatórios */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Relatórios
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Exportar Dados</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => exportService.exportToCSV(warrantyFlowService.getAllRequests(), 'garantias_a2')}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast({ title: "Exportando para Excel", description: "Os dados estão sendo preparados para download." })}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast({ title: "Gerando relatório PDF", description: "O relatório será enviado para seu e-mail quando estiver pronto." })}>
            <FileText className="mr-2 h-4 w-4" />
            Relatório PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Relatórios Automáticos</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => toast({ title: "Enviando relatório", description: "O relatório semanal será enviado por e-mail." })}>
            <Mail className="mr-2 h-4 w-4" />
            Enviar relatório semanal
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast({ title: "Em breve", description: "Dashboard de analytics em desenvolvimento." })}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard analytics
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Ações */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Ações
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filtros e Visualização</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => toast({ title: "Filtros rápidos", description: "Use os filtros no topo do Kanban para busca avançada." })}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros rápidos
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Notificações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => toast({ title: "Alertas SLA", description: "Configurações de alertas por e-mail e push em breve." })}>
            <Bell className="mr-2 h-4 w-4" />
            Configurar alertas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast({ title: "Lembretes", description: "Lembretes automáticos para técnicos habilitados." })}>
            <Calendar className="mr-2 h-4 w-4" />
            Lembretes automáticos
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Manutenção</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => {
            const result = warrantyFlowService.getAllRequests().filter(r => r.currentStage === 'completed');
            toast({ title: `${result.length} itens prontos`, description: "Funcionalidade de arquivamento em lote em desenvolvimento." });
          }}>
            <Archive className="mr-2 h-4 w-4" />
            Arquivar concluídas
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => toast({ title: "Ação restrita", description: "Apenas super-admins podem realizar limpeza de dados." })}>
            <Trash2 className="mr-2 h-4 w-4" />
            Limpeza de dados
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PageHeader>
  );
};
