
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
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      {groups.map((g, idx) => {
        const groupDone = g.items.every(i => i.conformity && i.conformity !== "pending");
        return (
          <Button
            key={g.id}
            variant={currentIndex === idx ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(idx)}
            className={cn("whitespace-nowrap rounded-full transition-all", groupDone && "border-green-500/50 bg-green-50/50")}
          >
            {groupDone && <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />}
            {g.name}
          </Button>
        );
      })}
    </div>
  );
};
