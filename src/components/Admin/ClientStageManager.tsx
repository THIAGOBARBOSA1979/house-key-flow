
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
  ChevronRight
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Gerenciamento de Etapas
        </CardTitle>
        <CardDescription>
          Controle o acesso e as funcionalidades disponíveis para o cliente
        </CardDescription>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Unlock className="h-5 w-5" />
              Liberar {releaseType === 'inspection' ? 'Vistoria' : 'Garantia'}
            </DialogTitle>
            <DialogDescription>
              {releaseType === 'inspection' 
                ? 'O cliente poderá agendar e realizar vistorias após esta liberação.'
                : 'O cliente poderá solicitar garantias após esta liberação.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Motivo da liberação (opcional)
              </label>
              <Textarea
                placeholder="Descreva o motivo da liberação manual..."
                value={releaseReason}
                onChange={(e) => setReleaseReason(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Atenção:</strong> Esta ação irá notificar o cliente sobre a liberação 
                e registrar o evento no histórico.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReleaseDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
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
