
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Users, 
  AlertCircle, 
  CheckCircle,
  Plus,
  Filter,
  Download,
  Settings
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { StatsCard } from "@/components/shared/StatsCard";

interface QuickActionsProps {
  todayAppointments: number;
  pendingAppointments: number;
  completedThisWeek: number;
  onNewAppointment: () => void;
  setFilterSheetOpen: (open: boolean) => void;
}

export const QuickActions = ({ 
  todayAppointments, 
  pendingAppointments, 
  completedThisWeek,
  onNewAppointment,
  setFilterSheetOpen
}: QuickActionsProps) => {
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    toast({
      title: "Ação executada",
      description: `${action} será implementado em breve.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          label="Hoje" 
          value={todayAppointments} 
          icon={CalendarIcon} 
          variant="brand" 
          description="Agendamentos para hoje"
        />
        <StatsCard 
          label="Pendentes" 
          value={pendingAppointments} 
          icon={Clock} 
          variant="pending" 
          description="Aguardando confirmação"
        />
        <StatsCard 
          label="Concluídos" 
          value={completedThisWeek} 
          icon={CheckCircle} 
          variant="complete" 
          description="Vistorias concluídas"
        />
        <StatsCard 
          label="SLA Médio" 
          value="4.2d" 
          icon={Clock} 
          variant="brand" 
          description="Tempo médio de resposta"
        />
      </div>

      <Card className="card-standard border-none bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-h4">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={onNewAppointment} className="rounded-lg font-bold">
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
            
            <Button variant="outline" onClick={() => setFilterSheetOpen(true)} className="rounded-lg font-bold">
              <Filter className="mr-2 h-4 w-4" />
              Filtros Avançados
            </Button>
            
            <Button variant="outline" onClick={() => handleQuickAction("Exportar agenda")} className="rounded-lg font-bold">
              <Download className="mr-2 h-4 w-4" />
              Exportar Agenda
            </Button>
            
            <Button variant="outline" onClick={() => handleQuickAction("Configurações")} className="rounded-lg font-bold">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
            
            <div className="ml-auto flex items-center">
              <Badge variant="outline" className="bg-status-critical/10 text-status-critical border-status-critical/20 rounded-lg text-sem-tiny font-black px-3 py-1">
                <AlertCircle className="mr-1.5 h-3 w-3" />
                3 CONFLITOS DETECTADOS
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
