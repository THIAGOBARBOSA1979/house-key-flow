import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Clock, User, MessageSquare } from "lucide-react";
import { Document, documentService } from "@/services/DocumentService";
import { useToast } from "@/hooks/use-toast";

interface DocumentWorkflowProps {
  document: Document;
  onUpdate: () => void;
}

export function DocumentWorkflow({ document, onUpdate }: DocumentWorkflowProps) {
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const handleApproval = (status: "approved" | "rejected") => {
    documentService.updateDocument(document.id, {
      approvalStatus: status,
      approvalComment: comment,
      approvedBy: "Admin Atual",
      approvedAt: new Date()
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
    <Card className="border-dashed">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
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

        {document.approvalStatus === "pending" && (
          <div className="space-y-3">
            <Textarea
              placeholder="Adicione um comentário de aprovação ou motivo da rejeição..."
              className="text-xs resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700" 
                onClick={() => handleApproval("approved")}
              >
                Aprovar
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                className="flex-1"
                onClick={() => handleApproval("rejected")}
              >
                Rejeitar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
