import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Clock, User, MessageSquare } from "lucide-react";
import { Document, documentService, ApprovalHistoryEntry } from "@/services";
import { useToast } from "@/hooks";
import { cn } from "@/lib/utils";

interface DocumentWorkflowProps {
  document: Document;
  onUpdate: () => void;
}

export function DocumentWorkflow({ document, onUpdate }: DocumentWorkflowProps) {
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const handleApproval = (status: "approved" | "rejected") => {
    const historyEntry: ApprovalHistoryEntry = {
      id: crypto.randomUUID(),
      status,
      comment,
      by: "Admin Atual",
      at: new Date(),
      performedBy: "Admin Atual",
      performedAt: new Date()
    };

    const approvalHistory = [...(document.approvalHistory || []), historyEntry];

    documentService.updateDocument(document.id, {
      approvalStatus: status,
      approvalComment: comment,
      approvedBy: "Admin Atual",
      approvedAt: new Date(),
      approvalHistory
    });
    
    toast({
      title: status === "approved" ? "Documento Aprovado" : "Documento Rejeitado",
      description: `O status foi atualizado para ${status === "approved" ? "aprovado" : "rejeitado"}.`,
    });
    
    onUpdate();
    setComment("");
  };

  const getStatusBadge = () => {
    switch (document.approvalStatus) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Aprovado</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejeitado</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pendente de Aprovação</Badge>;
    }
  };

  return (
    <Card className="card-standard border-dashed bg-background/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="py-3">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
          Fluxo de Aprovação
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {document.approvedBy && (
          <div className="text-xs text-muted-foreground flex flex-col gap-1 bg-muted/30 p-2 rounded">
            <div className="flex items-center gap-1">
              <User size={12} /> <strong>Avaliador:</strong> {document.approvedBy}
            </div>
            {document.approvedAt && (
              <div className="flex items-center gap-1">
                <Clock size={12} /> <strong>Data:</strong> {new Date(document.approvedAt).toLocaleString()}
              </div>
            )}
            {document.approvalComment && (
              <div className="flex items-start gap-1 mt-1 border-t pt-1">
                <MessageSquare size={12} className="mt-0.5" /> <strong>Comentário:</strong> {document.approvalComment}
              </div>
            )}
          </div>
        )}

        {document.approvalHistory && document.approvalHistory.length > 0 && (
          <div className="space-y-3 mt-4 border-t pt-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Histórico de Revisões</h4>
            {document.approvalHistory.map((entry) => (
              <div key={entry.id} className="text-[10px] border-l-2 border-primary/20 pl-2 py-1 space-y-1">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className={cn(
                    "text-[8px] h-4 px-1 uppercase",
                    entry.status === "approved" ? "border-green-200 text-green-700 bg-green-50" : "border-red-200 text-red-700 bg-red-50"
                  )}>
                    {entry.status === "approved" ? "Aprovado" : "Rejeitado"}
                  </Badge>
                  <span className="text-muted-foreground">{new Date(entry.performedAt).toLocaleDateString()}</span>
                </div>
                <p className="font-bold text-foreground/80">{entry.performedBy}</p>
                {entry.comment && <p className="italic text-muted-foreground">"{entry.comment}"</p>}
              </div>
            ))}
          </div>
        )}

        {document.approvalStatus === "pending" && (
          <div className="space-y-3">
            <Textarea
              placeholder="Adicione um comentário de aprovação ou motivo da rejeição..."
              className="text-xs resize-none min-h-[100px] rounded-lg border-muted-foreground/20 focus:border-primary transition-all"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700 font-bold h-10 shadow-sem-sm" 
                onClick={() => handleApproval("approved")}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Aprovar
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                className="flex-1 font-bold h-10 shadow-sem-sm"
                onClick={() => handleApproval("rejected")}
              >
                <XCircle className="w-4 h-4 mr-2" /> Rejeitar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
