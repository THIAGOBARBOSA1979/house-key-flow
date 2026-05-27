
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  ClipboardCheck, 
  ShieldCheck, 
  Unlock,
  History,
  ChevronRight,
  AlertTriangle,
  User
} from "lucide-react";
import { ClientStage, ClientProfile, STAGE_CONFIG } from "@/types/clientFlow";
import { clientStageService } from "@/services";
import { notificationService } from "@/services";
import { useToast } from "@/components/ui/use-toast";
import { StageIndicator } from "../client-flow/StageIndicator";
import { format } from "date-fns";

interface ClientStageManagerProps {
  clientId: string;
  onStageChange?: () => void;
}

export function ClientStageManager({ clientId, onStageChange }: ClientStageManagerProps) {
  const [isReleaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [releaseType, setReleaseType] = useState<'inspection' | 'warranty' | null>(null);
  const [releaseReason, setReleaseReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const profile = clientStageService.getClientProfile(clientId);

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Cliente não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const currentStageOrder = STAGE_CONFIG[profile.currentStage].order;
  const canReleaseInspection = currentStageOrder < 2;
  const canReleaseWarranty = currentStageOrder < 3;

  const handleOpenRelease = (type: 'inspection' | 'warranty') => {
    setReleaseType(type);
    setReleaseReason('');
    setReleaseDialogOpen(true);
  };

  const handleConfirmRelease = async () => {
    if (!releaseType) return;

    setIsLoading(true);
    try {
      const targetStage: ClientStage = releaseType === 'inspection' 
        ? 'inspection_enabled' 
        : 'warranty_enabled';

      const reason = releaseReason.trim() || 
        (releaseType === 'inspection' 
          ? 'Liberação manual de vistoria pelo administrador'
          : 'Liberação manual de garantia pelo administrador');

      const result = await clientStageService.advanceStage(
        clientId,
        targetStage,
        reason,
        'Administrador',
        false
      );

      if (!result.success) {
        toast({
          title: "Erro na liberação",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      // Create notification for client
      const notificationType = releaseType === 'inspection' 
        ? 'inspection_enabled' 
        : 'warranty_enabled';
      
      notificationService.createNotification(clientId, notificationType, profile.company_id || '', {
        relatedEntityType: 'stage'
      });

      toast({
        title: "Liberação realizada",
        description: `${releaseType === 'inspection' ? 'Vistoria' : 'Garantia'} liberada com sucesso para o cliente.`
      });

      setReleaseDialogOpen(false);
      onStageChange?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="px-6 py-5 border-b bg-muted/5">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Evolução da Jornada do Cliente
          </div>

        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Stage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Posicionamento Atual:</span>
            <StageIndicator currentStage={profile.currentStage} />
          </div>
          <p className="text-sm text-muted-foreground">
            {STAGE_CONFIG[profile.currentStage].description}
          </p>
        </div>

        {/* Stage Progress */}
        <div className="space-y-3">
          <span className="text-sm font-medium">Progresso:</span>
          <StageIndicator currentStage={profile.currentStage} variant="steps" />
        </div>

        {/* Release Actions */}
        <div className="space-y-3">
          <span className="text-sm font-medium text-muted-foreground">Ações de Habilitação Estratégica:</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="justify-start h-14 rounded-2xl border-2 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              disabled={!canReleaseInspection}
              onClick={() => handleOpenRelease('inspection')}
            >
              <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors mr-3">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <span className="flex-1 text-left font-bold text-sm">Liberar Vistoria</span>
              {!canReleaseInspection && (
                <Badge variant="success" className="ml-2">Liberado</Badge>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="justify-start h-14 rounded-2xl border-2 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              disabled={!canReleaseWarranty}
              onClick={() => handleOpenRelease('warranty')}
            >
              <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors mr-3">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="flex-1 text-left font-bold text-sm">Liberar Garantia</span>
              {!canReleaseWarranty && (
                <Badge variant="success" className="ml-2">Liberado</Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Stage History */}
        <div className="space-y-3">
          <span className="text-sm font-medium text-muted-foreground">Log de Auditoria da Jornada:</span>
          <div className="space-y-2">
            {profile.stageHistory.slice().reverse().map((change) => (
              <div 
                key={change.id} 
                className="flex items-start gap-4 p-4 bg-muted/20 rounded-2xl border border-border/5 hover:bg-muted/30 transition-all group"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={change.isAutomatic ? "info" : "outline"}>
                        {change.isAutomatic ? 'Automático' : 'Manual'}
                      </Badge>
                      <span className="text-sm font-black text-foreground uppercase tracking-tight">
                        {STAGE_CONFIG[change.toStage].label}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {format(change.changedAt, "dd/MM/yy HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {change.reason}
                  </p>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-3 flex items-center gap-1.5">
                    <User className="h-3 w-3" /> Executor: {change.changedBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Release Dialog */}
      <Dialog open={isReleaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b bg-muted/5">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <Unlock className="h-5 w-5 text-primary" />
              Habilitar {releaseType === 'inspection' ? 'Protocolo de Vistoria' : 'Módulo de Garantias'}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              {releaseType === 'inspection' 
                ? 'O cliente poderá agendar e realizar vistorias após esta liberação.'
                : 'O cliente poderá solicitar garantias após esta liberação.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Motivo da liberação (opcional)
              </label>
              <Textarea
                placeholder="Descreva o motivo da liberação manual..."
                className="rounded-xl min-h-[100px] resize-none border-muted-foreground/20 focus:border-primary transition-all"
                value={releaseReason}
                onChange={(e) => setReleaseReason(e.target.value)}
              />
            </div>
            
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 animate-in fade-in zoom-in-95">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                <strong>Atenção:</strong> Esta ação irá notificar o cliente sobre a liberação 
                e registrar o evento no histórico de auditoria.
              </p>
            </div>
          </div>

          <DialogFooter className="p-8 border-t border-border/10 bg-muted/5">
            <Button 
              variant="outline" 
              className="h-12 px-6 rounded-xl font-bold transition-all"
              onClick={() => setReleaseDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              className="h-12 px-10 rounded-xl font-black uppercase tracking-widest text-xs bg-primary hover:bg-primary/90 shadow-sem-md active:scale-95 transition-all"
              onClick={handleConfirmRelease}
              disabled={isLoading}
            >
              {isLoading ? 'Habilitando...' : 'Confirmar Habilitação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
