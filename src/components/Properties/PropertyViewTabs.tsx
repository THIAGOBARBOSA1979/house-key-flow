import { LayoutGrid, List as ListIcon, BarChart3 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PropertyViewTabsProps {
  viewMode: "grid" | "list" | "timeline";
  onViewModeChange: (mode: "grid" | "list" | "timeline") => void;
}

export const PropertyViewTabs = ({ viewMode, onViewModeChange }: PropertyViewTabsProps) => {
  return (
    <Tabs 
      value={viewMode} 
      onValueChange={(v) => onViewModeChange(v as any)} 
      className="hidden md:flex bg-muted/40 p-1.5 rounded-2xl shadow-inner shrink-0"
    >
      <TabsList className="bg-transparent border-none h-9 gap-1">
        <TabsTrigger value="grid" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sem-md h-full transition-all">
          <LayoutGrid className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="list" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sem-md h-full transition-all">
          <ListIcon className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="timeline" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sem-md h-full transition-all px-3 gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Timeline</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
