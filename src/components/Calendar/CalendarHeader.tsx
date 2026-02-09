import { CalendarIcon, Filter, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScheduleInspectionDialog } from "@/components/Inspection/ScheduleInspectionDialog";
import { PageHeader } from "@/components/Layout/PageHeader";

interface CalendarHeaderProps {
  onChangeView: (view: string) => void;
}

export function CalendarHeader({ onChangeView }: CalendarHeaderProps) {
  return (
    <PageHeader
      icon={CalendarIcon}
      title="Agendamentos"
      description="Gestão de agendamentos de vistorias e atendimentos técnicos"
    >
      <ScheduleInspectionDialog />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Visualizar por
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onChangeView("calendar")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendário
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeView("list")}>
            <FileCheck className="mr-2 h-4 w-4" />
            Lista
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PageHeader>
  );
}
