
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
  AlertTriangle
} from "lucide-react";
import { ClientStage, ClientProfile, STAGE_CONFIG } from "@/types/clientFlow";
import { clientStageService } from "@/services/ClientStageService";
import { notificationService } from "@/services/NotificationService";
import { useToast } from "@/components/ui/use-toast";
import { StageIndicator } from "../ClientFlow/StageIndicator";
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

      const result = clientStageService.advanceStage(
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
      
      notificationService.createNotification(clientId, notificationType, {
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
            Gerenciamento de Etapas
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Stage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Etapa Atual:</span>
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
          <span className="text-sm font-medium">Ações de Liberação:</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start"
              disabled={!canReleaseInspection}
              onClick={() => handleOpenRelease('inspection')}
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              <span className="flex-1 text-left">Liberar Vistoria</span>
              {!canReleaseInspection && (
                <Badge variant="secondary" className="ml-2">Liberado</Badge>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="justify-start"
              disabled={!canReleaseWarranty}
              onClick={() => handleOpenRelease('warranty')}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              <span className="flex-1 text-left">Liberar Garantia</span>
              {!canReleaseWarranty && (
                <Badge variant="secondary" className="ml-2">Liberado</Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Stage History */}
        <div className="space-y-3">
          <span className="text-sm font-medium">Histórico de Alterações:</span>
          <div className="space-y-2">
            {profile.stageHistory.slice().reverse().map((change) => (
              <div 
                key={change.id} 
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={change.isAutomatic ? "secondary" : "outline"}>
                      {change.isAutomatic ? 'Automático' : 'Manual'}
                    </Badge>
                    <span className="text-sm font-medium">
                      {STAGE_CONFIG[change.toStage].label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {change.reason}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(change.changedAt, "dd/MM/yyyy 'às' HH:mm")} • Por: {change.changedBy}
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
              Liberar {releaseType === 'inspection' ? 'Vistoria' : 'Garantia'}
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
              {isLoading ? 'Liberando...' : 'Confirmar Liberação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
