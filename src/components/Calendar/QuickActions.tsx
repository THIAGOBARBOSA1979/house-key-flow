
import { useState, useEffect } from "react";
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
  Settings,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { StatsCard } from "@/components/shared/StatsCard";
import { inspectionService } from "@/services/InspectionService";

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
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [sla, setSla] = useState("...");

  useEffect(() => {
    setConflicts(inspectionService.getAllConflicts());
    setSla(inspectionService.getSLAMetrics());
  }, []);

  const handleExport = (format: 'json' | 'csv') => {
    const data = inspectionService.exportData(format);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agenda-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Exportação concluída",
      description: `Sua agenda foi exportada com sucesso em formato ${format.toUpperCase()}.`,
    });
  };

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
            
            {conflicts.length > 0 && (
              <div className="ml-auto flex items-center">
                <Badge variant="outline" className="bg-status-critical/10 text-status-critical border-status-critical/20 rounded-lg text-sem-tiny font-black px-3 py-1 flex items-center gap-2 cursor-help group relative">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {conflicts.length} {conflicts.length === 1 ? 'CONFLITO DETECTADO' : 'CONFLITOS DETECTADOS'}
                  
                  {/* Tooltip implementation */}
                  <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-white border border-border rounded-xl shadow-sem-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    <p className="text-foreground text-xs font-bold mb-2">Conflitos de Agenda:</p>
                    <div className="space-y-2">
                      {conflicts.slice(0, 3).map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] text-muted-foreground border-b border-border/10 pb-1">
                          <span>{c.technician}</span>
                          <span className="font-bold text-status-critical">{c.date}</span>
                        </div>
                      ))}
                      {conflicts.length > 3 && (
                        <p className="text-[9px] italic text-center">E mais {conflicts.length - 3}...</p>
                      )}
                    </div>
                  </div>
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
