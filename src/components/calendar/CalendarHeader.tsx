import { CalendarIcon, Filter, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScheduleInspectionDialog } from "@/components/inspection/ScheduleInspectionDialog";
import { PageHeader } from "@/components/layout/PageHeader";

interface CalendarHeaderProps {
  onChangeView: (view: string) => void;
}

export function CalendarHeader({ onChangeView }: CalendarHeaderProps) {
  return (
    <PageHeader
      icon={CalendarIcon}
      title="Cronograma Inteligente"
      description="Gerencie agendamentos de vistorias técnicas e atendimentos com visão estratégica de campo."

    >
      <ScheduleInspectionDialog />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="hidden lg:flex rounded-xl font-bold shadow-sem-sm">
            <Filter className="mr-2 h-4 w-4" />
            Exportar dados
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl p-1 shadow-sem-lg border-border/10">
          <DropdownMenuItem 
            className="rounded-lg py-2 cursor-pointer font-medium"
            onClick={async () => {
              const { inspectionService } = await import("@/services");
              const data = await inspectionService.exportData('csv');
              const blob = new Blob([data], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `relatorio-agendamentos.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
          >
            Exportar como CSV
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="rounded-lg py-2 cursor-pointer font-medium"
            onClick={async () => {
              const { inspectionService } = await import("@/services");
              const data = await inspectionService.exportData('json');
              const blob = new Blob([data], { type: 'application/json' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `relatorio-agendamentos.json`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
          >
            Exportar como JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PageHeader>
  );
}
