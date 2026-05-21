
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChecklistGroup } from "@/services";

interface ChecklistGroupTabsProps {
  groups: ChecklistGroup[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export const ChecklistGroupTabs = ({ groups, currentIndex, onSelect }: ChecklistGroupTabsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar scroll-smooth">
      {groups.map((g, idx) => {
        const total = g.items.length;
        const done = g.items.filter(i => i.conformity && i.conformity !== "pending").length;
        const groupDone = done === total && total > 0;
        
        return (
          <Button
            key={g.id}
            variant={currentIndex === idx ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(idx)}
            className={cn(
              "whitespace-nowrap rounded-xl transition-all h-10 px-4 font-bold border-muted-foreground/20",
              groupDone && "border-emerald-500/50 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/50",
              currentIndex === idx && "shadow-lg shadow-primary/20 scale-105 z-10"
            )}
          >
            {groupDone ? (
              <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" strokeWidth={3} />
            ) : (
              <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] mr-2">
                {idx + 1}
              </span>
            )}
            {g.name}
            {total > 0 && !groupDone && (
              <span className="ml-2 text-[9px] opacity-60 bg-foreground/10 px-1.5 py-0.5 rounded-md">
                {done}/{total}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};
