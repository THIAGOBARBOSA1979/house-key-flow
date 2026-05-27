import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NonConformity, nonConformityService } from "@/services/operations/NonConformityService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Calendar,
  User,
  History,
  ArrowRight
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks";
import { Loader2 } from "lucide-react";

interface NonConformityDetailsProps {
  nc: NonConformity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const NonConformityDetails = ({ nc, open, onOpenChange, onUpdate }: NonConformityDetailsProps) => {
  const { toast } = useToast();
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [closingData, setClosingData] = useState({
    root_cause: "",
    corrective_action: "",
    prevention_plan: ""
  });

  if (!nc) return null;

  const handleCloseNC = async () => {
    if (!closingData.root_cause || !closingData.corrective_action) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a Causa Raiz e a Ação Corretiva para fechar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await nonConformityService.close(nc.id, closingData);
      toast({
        title: "Sucesso",
        description: "Não conformidade encerrada com sucesso.",
      });
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível encerrar a não conformidade.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-card border-none shadow-sem-xl">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <AlertTriangle className={nc.status === 'closed' ? 'text-emerald-500' : 'text-orange-500'} />
              {nc.title}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">
              Registro de Não Conformidade • ID #{nc.id.substring(0, 8)}
            </DialogDescription>
          </div>
          <StatusBadge status={nc.status === 'closed' ? 'complete' : nc.status === 'corrective_action' ? 'progress' : 'pending'} />
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText className="h-3 w-3" /> Descrição do Evento
              </h4>
              <p className="text-sm font-medium leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/10">
                {nc.description}
              </p>
            </div>

            {nc.status === 'closed' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" /> Causa Raiz Identificada
                  </h4>
                  <p className="text-sm font-medium leading-relaxed bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                    {nc.root_cause}
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" /> Ação Corretiva Aplicada
                  </h4>
                  <p className="text-sm font-medium leading-relaxed bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                    {nc.corrective_action}
                  </p>
                </div>
              </div>
            ) : isClosing ? (
              <div className="space-y-6 p-6 bg-primary/5 rounded-[2rem] border border-primary/10 animate-in zoom-in-95 duration-300">
                <h3 className="font-black text-lg tracking-tight uppercase">Protocolo de Encerramento</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Análise de Causa Raiz</label>
                    <Textarea 
                      placeholder="Por que este evento ocorreu? (Ex: Falha no processo X)"
                      className="rounded-xl resize-none font-medium h-24"
                      value={closingData.root_cause}
                      onChange={(e) => setClosingData({...closingData, root_cause: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ação Corretiva Executada</label>
                    <Textarea 
                      placeholder="O que foi feito para corrigir e validar?"
                      className="rounded-xl resize-none font-medium h-24"
                      value={closingData.corrective_action}
                      onChange={(e) => setClosingData({...closingData, corrective_action: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setIsClosing(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1 rounded-xl font-black uppercase tracking-widest text-[11px] h-12 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleCloseNC}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Efetivar Fechamento
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="space-y-4 p-5 rounded-2xl bg-muted/20 border border-border/10">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Atributos</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase">Severidade</span>
                  </div>
                  <Badge className={`text-[9px] font-black uppercase ${getSeverityColor(nc.severity)}`}>
                    {nc.severity}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase">Identificado</span>
                  </div>
                  <span className="text-[11px] font-black">
                    {format(new Date(nc.identified_at), "dd MMM yyyy", { locale: ptBR })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase">Responsável</span>
                  </div>
                  <span className="text-[11px] font-black">Eng. de Qualidade</span>
                </div>

                {nc.status === 'closed' && nc.closed_at && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase">Encerrado em</span>
                    </div>
                    <span className="text-[11px] font-black text-emerald-600">
                      {format(new Date(nc.closed_at), "dd MMM yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button variant="outline" className="w-full rounded-xl border-border/40 font-bold h-11 text-xs justify-between group">
              <span className="flex items-center gap-2">
                <History className="h-4 w-4" /> Histórico de Alterações
              </span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        <DialogFooter className="border-t border-border/10 pt-6">
          {nc.status !== 'closed' && !isClosing && (
            <Button 
              className="w-full rounded-xl font-black uppercase tracking-widest text-[11px] h-12 shadow-lg shadow-primary/20"
              onClick={() => setIsClosing(true)}
            >
              Iniciar Plano de Ação & Fechamento
            </Button>
          )}
          {nc.status === 'closed' && (
            <Button variant="outline" className="w-full rounded-xl font-bold h-12" onClick={() => onOpenChange(false)}>
              Fechar Detalhes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};