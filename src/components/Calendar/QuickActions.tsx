
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
          value={sla} 
          icon={Clock} 
          variant="brand" 
          description="Tempo médio de resposta"
        />
      </div>

      <Card className="card-standard border-none bg-card/50 backdrop-blur-sm shadow-sem-sm">
        <CardHeader className="pb-3 pt-4 px-5 sm:px-6">
          <CardTitle className="text-sem-body-sm font-black uppercase tracking-widest text-muted-foreground">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button onClick={onNewAppointment} className="font-black uppercase tracking-widest text-xs">
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
            
            <Button variant="outline" onClick={() => setFilterSheetOpen(true)} className="font-black uppercase tracking-widest text-xs">
              <Filter className="mr-2 h-4 w-4" />
              Filtros Avançados
            </Button>
            
            <Button variant="outline" onClick={() => handleExport("csv")} className="font-black uppercase tracking-widest text-xs">
              <Download className="mr-2 h-4 w-4" />
              Exportar Agenda
            </Button>
            
            <Button variant="outline" onClick={() => handleQuickAction("Configurações")} className="font-black uppercase tracking-widest text-xs">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
            
            {conflicts.length > 0 && (
              <div className="sm:col-span-2 lg:col-span-4 flex items-center mt-2">
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 rounded-xl text-[10px] font-black px-4 py-2 flex items-center gap-2 cursor-help group relative w-full sm:w-auto">
                  <AlertCircle className="h-4 w-4" />
                  {conflicts.length} {conflicts.length === 1 ? 'CONFLITO DE AGENDA DETECTADO' : 'CONFLITOS DE AGENDA DETECTADOS'}
                  
                  {/* Tooltip implementation */}
                  <div className="absolute bottom-full left-0 mb-3 w-72 p-4 bg-white border border-border rounded-2xl shadow-sem-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-50 transform translate-y-2 group-hover:translate-y-0">
                    <p className="text-foreground text-xs font-black uppercase tracking-widest mb-3 border-b border-border/10 pb-2">Detalhes dos Conflitos:</p>
                    <div className="space-y-3">
                      {conflicts.slice(0, 4).map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/20 p-2 rounded-lg">
                          <span className="font-bold">Técnico {c.technician}</span>
                          <span className="font-black text-red-600 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">{c.date}</span>
                        </div>
                      ))}
                      {conflicts.length > 4 && (
                        <p className="text-[10px] font-bold text-primary italic text-center pt-1">+ {conflicts.length - 4} outros conflitos</p>
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
