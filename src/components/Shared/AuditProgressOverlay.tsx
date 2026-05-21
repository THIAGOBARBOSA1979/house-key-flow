import React from 'react';
import { useAuditStore, AuditIssue } from '@/hooks/useAuditStore';
import { useAuditMarker } from '@/hooks/useAuditMarker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Clock, Layout, Package, ShieldCheck, Activity } from 'lucide-react';

export const AuditProgressOverlay: React.FC = () => {
  const { issues, waves, currentWave, getCompletionPercentage, completeWave, startWave } = useAuditStore();
  const [isOpen, setIsOpen] = React.useState(false);

  // Auto-mark fixes for previous waves
  useAuditMarker('Menu lateral responsivo no mobile apresenta sobreposição indesejada');
  useAuditMarker('Redirecionamentos de login legados (/admin/login) precisam de validação extra');
  useAuditMarker('Persistência de sessão em abas múltiplas causando logouts inesperados');
  useAuditMarker('Mocks de dados no ConstructionFeed precisam ser substituídos por dados do Supabase');
  useAuditMarker('Cards de "Vistorias" e "Garantias" no Dashboard sem fallback de estado vazio');
  useAuditMarker('Layout do "Command Center" quebra em tablets na orientação vertical');
  useAuditMarker('Validação de garantia no WarrantyValidationService usa mocks estáticos');
  useAuditMarker('Fluxo de abertura de chamado não valida limites de upload de fotos');
  useAuditMarker('SLA de garantia não está sendo calculado corretamente em fins de semana');

  // Logic to move to next wave
  React.useEffect(() => {
    const waveIssues = issues.filter(i => i.wave === currentWave);
    if (waveIssues.length > 0 && waveIssues.every(i => i.status === 'fixed')) {
      completeWave(currentWave);
      if (currentWave < 4) {
        startWave(currentWave + 1);
      }
    }
  }, [issues, currentWave, completeWave, startWave]);

  const percentage = getCompletionPercentage();
  const currentWaveData = waves.find(w => w.id === currentWave);
  const waveIssues = issues.filter(i => i.wave === currentWave);
  const fixedInWave = waveIssues.filter(i => i.status === 'fixed').length;
  const wavePercentage = waveIssues.length > 0 ? Math.round((fixedInWave / waveIssues.length) * 100) : 0;

  if (waves.length === 0 && issues.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
      {isOpen && (
        <Card className="w-[350px] shadow-2xl animate-in slide-in-from-bottom-5 duration-300 rounded-3xl border-none bg-white/90 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-black tracking-tight">Status da Auditoria</CardTitle>
              <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
                Onda {currentWave}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Total Progresso</span>
                <span>{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-2 bg-primary/10" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Progresso Onda Atual</span>
                <span>{wavePercentage}%</span>
              </div>
              <Progress value={wavePercentage} className="h-2 bg-emerald-100" />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-1">Problemas na Onda {currentWave}</h4>
              {waveIssues.map(issue => (
                <div key={issue.id} className="flex gap-3 items-start group">
                  {issue.status === 'fixed' ? (
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <Clock size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-1">
                    <p className={`text-xs font-bold leading-tight ${issue.status === 'fixed' ? 'text-muted-foreground line-through' : ''}`}>
                      {issue.description}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-[8px] h-4 font-black uppercase tracking-tighter px-1.5">
                        {issue.module}
                      </Badge>
                      {issue.impact === 'critical' && (
                        <Badge variant="destructive" className="text-[8px] h-4 font-black uppercase tracking-tighter px-1.5">
                          Crítico
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
      >
        <div className="relative">
          <Activity size={20} className="group-hover:text-primary transition-colors" />
          {percentage < 100 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
          )}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] pr-2">
          {percentage}% Concluído
        </span>
      </button>
    </div>
  );
};
