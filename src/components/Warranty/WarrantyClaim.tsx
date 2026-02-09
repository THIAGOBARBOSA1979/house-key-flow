import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "../shared/StatusBadge";
import { Calendar, MessageSquare, Building, Home, ListTodo } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface WarrantyClaimProps {
  claim: {
    id: string;
    title: string;
    property: string;
    unit: string;
    client: string;
    description: string;
    createdAt: Date;
    status: "pending" | "progress" | "complete" | "critical";
  };
  onAtender?: () => void;
  onGerenciarProblemas?: () => void;
}

export const WarrantyClaim = ({ claim, onAtender, onGerenciarProblemas }: WarrantyClaimProps) => {
  const { toast } = useToast();

  const handleDetails = () => {
    toast({
      title: "Detalhes da garantia",
      description: `Visualizando detalhes de "${claim.title}" - ${claim.property}, Unidade ${claim.unit}.`,
    });
  };

  const handleAtender = () => {
    if (onAtender) {
      onAtender();
    } else {
      toast({
        title: "Atendimento iniciado",
        description: `A solicitação "${claim.title}" está sendo atendida.`,
      });
    }
  };

  const handleGerenciarProblemas = () => {
    if (onGerenciarProblemas) {
      onGerenciarProblemas();
    } else {
      toast({
        title: "Gerenciando problemas",
        description: `Abrindo gerenciamento de problemas para "${claim.title}".`,
      });
    }
  };

  return (
    <Card className="card-hover">
      <CardContent className="p-4 pb-2">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium">{claim.title}</h3>
          <StatusBadge status={claim.status} />
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Building size={14} />
            <span>{claim.property}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Home size={14} />
            <span>Unidade {claim.unit}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar size={14} />
            <span>Aberto em {format(claim.createdAt, "dd/MM/yyyy")}</span>
          </div>
        </div>
        
        <div className="text-sm mb-2">
          <MessageSquare size={14} className="inline mr-1 text-muted-foreground" />
          <p className="inline line-clamp-2">{claim.description}</p>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-2 flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleDetails}>Detalhes</Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGerenciarProblemas}
          className="gap-1"
        >
          <ListTodo className="h-4 w-4" />
          Problemas
        </Button>
        <Button variant="default" size="sm" onClick={handleAtender}>Atender</Button>
      </CardFooter>
    </Card>
  );
};
