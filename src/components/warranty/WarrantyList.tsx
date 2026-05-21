
import { WarrantyClaim } from "./WarrantyClaim";
import { ListTodo } from "lucide-react";

interface WarrantyClaim {
  id: string;
  title: string;
  property: string;
  unit: string;
  client: string;
  description: string;
  createdAt: Date;
  status: "pending" | "progress" | "complete" | "critical";
}

interface WarrantyListProps {
  claims: WarrantyClaim[];
  onAtender: (id: string, title: string) => void;
  onGerenciarProblemas: (id: string, title: string) => void;
}

export const WarrantyList = ({ claims, onAtender, onGerenciarProblemas }: WarrantyListProps) => {
  if (claims.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
        <ListTodo className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="font-medium">Nenhuma solicitação encontrada</h3>
        <p className="text-muted-foreground text-sm">Tente mudar seus filtros ou adicionar uma nova solicitação.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {claims.map((claim) => (
        <WarrantyClaim 
          key={claim.id} 
          claim={claim} 
          onAtender={() => onAtender(claim.id, claim.title)}
          onGerenciarProblemas={() => onGerenciarProblemas(claim.id, claim.title)}
        />
      ))}
    </div>
  );
};
