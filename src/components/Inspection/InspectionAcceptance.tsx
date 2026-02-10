import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { InspectionAcceptanceStatus } from "@/types/clientFlow";

interface InspectionAcceptanceProps {
  inspectionId: string;
  status: InspectionAcceptanceStatus;
  conformeCount: number;
  naoConformeCount: number;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  onAccept: (inspectionId: string) => void;
  onReject: (inspectionId: string, reason: string) => void;
}

export const InspectionAcceptance = ({
  inspectionId,
  status,
  conformeCount,
  naoConformeCount,
  acceptedAt,
  rejectedAt,
  rejectionReason,
  onAccept,
  onReject,
}: InspectionAcceptanceProps) => {
  const { toast } = useToast();
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleAccept = () => {
    onAccept(inspectionId);
    setAcceptDialogOpen(false);
    toast({
      title: "Vistoria aceita com sucesso",
      description: "O módulo de garantias foi liberado para você.",
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Por favor, informe o motivo da recusa.",
        variant: "destructive",
      });
      return;
    }
    onReject(inspectionId, rejectReason);
    setRejectDialogOpen(false);
    setRejectReason("");
    toast({
      title: "Vistoria recusada",
      description: "Nossa equipe entrará em contato para tratar as pendências.",
    });
  };

  const totalItems = conformeCount + naoConformeCount;

  if (status === "accepted") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-medium text-green-900">Vistoria aceita</h3>
            <p className="text-sm text-green-700">
              Aceita em {acceptedAt ? format(acceptedAt, "dd/MM/yyyy 'às' HH:mm") : "—"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-3">
          <XCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-900">Vistoria recusada</h3>
            <p className="text-sm text-red-700">
              Recusada em {rejectedAt ? format(rejectedAt, "dd/MM/yyyy 'às' HH:mm") : "—"}
            </p>
            {rejectionReason && (
              <p className="text-sm text-red-600 mt-1">
                <span className="font-medium">Motivo:</span> {rejectionReason}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // pending_acceptance
  return (
    <>
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Aceite de Vistoria Pendente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-lg p-3 text-center border">
              <div className="text-2xl font-bold text-green-600">{conformeCount}</div>
              <div className="text-xs text-muted-foreground">Itens conformes</div>
            </div>
            <div className="bg-background rounded-lg p-3 text-center border">
              <div className="text-2xl font-bold text-red-600">{naoConformeCount}</div>
              <div className="text-xs text-muted-foreground">Itens não conformes</div>
            </div>
          </div>

          {naoConformeCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-100 rounded-md">
              <AlertTriangle className="h-4 w-4 text-amber-700 mt-0.5" />
              <p className="text-sm text-amber-800">
                Foram identificados {naoConformeCount} itens não conformes de um total de {totalItems}. 
                Revise os itens antes de aceitar.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1"
              variant="default"
              onClick={() => setAcceptDialogOpen(true)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aceitar Vistoria
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => setRejectDialogOpen(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Recusar Vistoria
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accept confirmation dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Aceite de Vistoria</DialogTitle>
            <DialogDescription>
              Ao aceitar a vistoria, você confirma que está de acordo com as condições 
              do imóvel conforme verificado. O módulo de garantias será liberado automaticamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAccept}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Aceite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog with reason */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar Vistoria</DialogTitle>
            <DialogDescription>
              Informe o motivo da recusa. Nossa equipe entrará em contato para resolver as pendências.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Descreva o motivo da recusa..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              <XCircle className="h-4 w-4 mr-2" />
              Confirmar Recusa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
