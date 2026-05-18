import { ReactNode } from "react";
import { Kanban, BarChart3, Settings, History } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export const WarrantyTabsHeader = () => {
  return (
    <TabsList className="flex w-full max-w-lg overflow-x-auto no-scrollbar bg-muted/50 p-1 rounded-xl h-auto min-h-10">
      <TabsTrigger value="kanban" className="gap-2 rounded-lg py-2">
        <Kanban className="h-4 w-4" />
        <span className="hidden sm:inline">Kanban</span>
      </TabsTrigger>
      <TabsTrigger value="dashboard" className="gap-2 rounded-lg py-2">
        <BarChart3 className="h-4 w-4" />
        <span className="hidden sm:inline">Métricas</span>
      </TabsTrigger>
      <TabsTrigger value="sla" className="gap-2 rounded-lg py-2">
        <Settings className="h-4 w-4" />
        <span className="hidden sm:inline">SLA</span>
      </TabsTrigger>
      <TabsTrigger value="logs" className="gap-2 rounded-lg py-2">
        <History className="h-4 w-4" />
        <span className="hidden sm:inline">Logs</span>
      </TabsTrigger>
    </TabsList>
  );
};
