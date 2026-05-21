
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarrantyList } from "./WarrantyList";

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

interface WarrantyTabsProps {
  getFilteredClaims: (status: string) => WarrantyClaim[];
  onAtender: (id: string, title: string) => void;
  onGerenciarProblemas: (id: string, title: string) => void;
}

export const WarrantyTabs = ({ getFilteredClaims, onAtender, onGerenciarProblemas }: WarrantyTabsProps) => {
  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">Todas</TabsTrigger>
        <TabsTrigger value="critical">Críticas</TabsTrigger>
        <TabsTrigger value="pending">Pendentes</TabsTrigger>
        <TabsTrigger value="in-progress">Em andamento</TabsTrigger>
        <TabsTrigger value="completed">Concluídas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="space-y-4 pt-4">
        <WarrantyList
          claims={getFilteredClaims("all")}
          onAtender={onAtender}
          onGerenciarProblemas={onGerenciarProblemas}
        />
      </TabsContent>
      
      <TabsContent value="critical" className="space-y-4 pt-4">
        <WarrantyList
          claims={getFilteredClaims("critical")}
          onAtender={onAtender}
          onGerenciarProblemas={onGerenciarProblemas}
        />
      </TabsContent>
      
      <TabsContent value="pending" className="space-y-4 pt-4">
        <WarrantyList
          claims={getFilteredClaims("pending")}
          onAtender={onAtender}
          onGerenciarProblemas={onGerenciarProblemas}
        />
      </TabsContent>
      
      <TabsContent value="in-progress" className="space-y-4 pt-4">
        <WarrantyList
          claims={getFilteredClaims("progress")}
          onAtender={onAtender}
          onGerenciarProblemas={onGerenciarProblemas}
        />
      </TabsContent>
      
      <TabsContent value="completed" className="space-y-4 pt-4">
        <WarrantyList
          claims={getFilteredClaims("complete")}
          onAtender={onAtender}
          onGerenciarProblemas={onGerenciarProblemas}
        />
      </TabsContent>
    </Tabs>
  );
};
