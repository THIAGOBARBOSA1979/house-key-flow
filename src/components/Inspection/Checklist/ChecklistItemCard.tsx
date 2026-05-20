
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { ChecklistItem } from "@/services";

interface ChecklistItemCardProps {
  item: ChecklistItem;
  onConformityChange: (value: "conform" | "nonconform") => void;
  onNotesChange: (notes: string) => void;
}

export const ChecklistItemCard = ({ item, onConformityChange, onNotesChange }: ChecklistItemCardProps) => {
  return (
    <Card className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm card-hover-effect">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <span className="font-semibold text-sm leading-tight text-foreground/90">{item.name || item.description}</span>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant={item.conformity === "conform" ? "default" : "outline"}
              className={item.conformity === "conform" ? "bg-green-600 hover:bg-green-700 shadow-sm" : "hover:border-green-500 hover:text-green-600"}
              onClick={() => onConformityChange("conform")}
            >
              <Check className="h-3 w-3 mr-1" /> OK
            </Button>
            <Button
              size="sm"
              variant={item.conformity === "nonconform" ? "default" : "outline"}
              className={item.conformity === "nonconform" ? "bg-red-600 hover:bg-red-700 shadow-sm" : "hover:border-red-500 hover:text-red-600"}
              onClick={() => onConformityChange("nonconform")}
            >
              <X className="h-3 w-3 mr-1" /> Falha
            </Button>
          </div>
        </div>

        {item.conformity && item.conformity !== "pending" && (
          <div className="animate-in slide-in-from-top-2 duration-200 space-y-2">
            <Textarea
              placeholder="Descreva observações ou detalhes da não conformidade..."
              className="text-xs min-h-[70px] bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all"
              value={item.notes || ""}
              onChange={e => onNotesChange(e.target.value)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
