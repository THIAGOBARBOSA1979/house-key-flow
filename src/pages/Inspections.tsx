import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Calendar as CalendarIcon, ListFilter } from "lucide-react";
import { InspectionItem } from "@/components/Inspection/InspectionItem";
import { PageHeader } from "@/components/Layout/PageHeader";
import { FilterBar } from "@/components/Layout/FilterBar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScheduleInspectionDialog } from "@/components/Inspection/ScheduleInspectionDialog";
import { Card, CardContent } from "@/components/ui/card";

// Mock data
const inspections = [
  {
    id: "1",
    property: "Edifício Aurora",
    unit: "101",
    client: "João Silva",
    scheduledDate: new Date(),
    status: "pending" as const
  },
  {
    id: "2",
    property: "Residencial Bosque",
    unit: "302",
    client: "Maria Santos",
    scheduledDate: new Date(),
    status: "progress" as const
  }
];

export default function Inspections() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || inspection.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        title="Vistorias"
        description="Gerenciamento de vistorias e entregas de unidades"
      >
        <Button variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Calendário
        </Button>
        <ScheduleInspectionDialog />
      </PageHeader>

      <FilterBar
        searchPlaceholder="Buscar agendamentos..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      >
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="progress">Em andamento</SelectItem>
            <SelectItem value="complete">Concluídos</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <ListFilter className="mr-2 h-4 w-4" />
          Mais filtros
        </Button>
      </FilterBar>

      <div className="grid gap-4">
        {filteredInspections.map((inspection) => (
          <Card 
            key={inspection.id} 
            className="overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30"
          >
            <CardContent className="p-0">
              <InspectionItem inspection={inspection} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <Button variant="outline">Anterior</Button>
        <Button variant="outline">Próxima</Button>
      </div>
    </div>
  );
}