
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Stats Cards */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayAppointments}</p>
              <p className="text-sm text-muted-foreground">Hoje</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingAppointments}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedThisWeek}</p>
              <p className="text-sm text-muted-foreground">Esta Semana</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">85%</p>
              <p className="text-sm text-muted-foreground">Taxa Conclusão</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onNewAppointment}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
            
            <Button variant="outline" onClick={() => setFilterSheetOpen(true)}>
              <Filter className="mr-2 h-4 w-4" />
              Filtros Avançados
            </Button>
            
            <Button variant="outline" onClick={() => handleQuickAction("Exportar agenda")}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Agenda
            </Button>
            
            <Button variant="outline" onClick={() => handleQuickAction("Configurações")}>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
            
            <Badge variant="outline" className="ml-auto">
              <AlertCircle className="mr-1 h-3 w-3" />
              3 conflitos detectados
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
