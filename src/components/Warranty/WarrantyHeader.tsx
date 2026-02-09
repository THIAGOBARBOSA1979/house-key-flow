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
          <DropdownMenuItem onClick={onExportData}>
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
          <DropdownMenuItem onClick={() => toast({ title: "Filtros avançados", description: "Abrindo painel de filtros avançados." })}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros avançados
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Notificações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => toast({ title: "Configurações de notificação", description: "Abrindo configurações de alertas e notificações." })}>
            <Bell className="mr-2 h-4 w-4" />
            Configurar alertas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast({ title: "Lembretes", description: "Configurando lembretes automáticos." })}>
            <Calendar className="mr-2 h-4 w-4" />
            Lembretes automáticos
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Manutenção</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => toast({ title: "Arquivando garantias antigas", description: "Garantias concluídas há mais de 6 meses serão arquivadas." })}>
            <Archive className="mr-2 h-4 w-4" />
            Arquivar antigas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast({ title: "Limpeza de dados", description: "Removendo dados temporários e otimizando o sistema." })}>
            <Trash2 className="mr-2 h-4 w-4" />
            Limpeza de dados
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PageHeader>
  );
};
