

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { checklistService } from "@/services/ChecklistService";

export const ChecklistSelector = ({ 
  onSelect 
}: { 
  onSelect: (id: string) => void 
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const templates = useMemo(() => checklistService.getAllTemplates(), []);
  
  const handleSelect = (id: string) => {
    const template = checklistService.getTemplateById(id);
    setSelectedId(id);
    onSelect(id);
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {templates.map((checklist) => (
          <Card 
            key={checklist.id}
            className={cn(
              "cursor-pointer border transition-all duration-200", 
              selectedId === checklist.id 
                ? "border-primary bg-primary/5 ring-1 ring-primary" 
                : "hover:border-primary/50"
            )}
            onClick={() => handleSelect(checklist.id)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    selectedId === checklist.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm leading-tight">{checklist.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{checklist.description}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {(checklist.groups?.reduce((acc, g) => acc + g.items.length, 0) || 0)} Itens
                      </span>
                    </div>
                  </div>
                </div>
                {selectedId === checklist.id && (
                  <div className="p-1 bg-primary rounded-full text-white shrink-0 mt-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Button 
        variant="outline" 
        type="button" 
        size="sm"
        className="w-full border-dashed text-xs h-9 font-bold active:scale-95 transition-all"
        onClick={() => {
          if (window.confirm("As alterações não salvas serão perdidas. Deseja continuar para o gerenciamento de checklists?")) {
            window.location.href = "/admin/checklist";
          }
        }}
      >
        <Plus className="mr-2 h-3.5 w-3.5" /> 
        Gerenciar modelos de checklist
      </Button>
    </div>
  );
};

import { Plus } from "lucide-react";

