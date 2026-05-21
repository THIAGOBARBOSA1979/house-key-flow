

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { checklistService } from "@/services";

export const ChecklistSelector = ({ 
  onSelect 
}: { 
  onSelect: (id: string) => void 
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    checklistService.getAllTemplates().then(setTemplates);
  }, []);

  const handleSelect = async (id: string) => {
    const template = await checklistService.getTemplateById(id);
    setSelectedId(id);
    onSelect(id);
  };
  
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4">
        {templates.map((checklist) => (
          <Card 
            key={checklist.id}
            className={cn(
              "cursor-pointer border-2 transition-all duration-500 rounded-2xl group", 
              selectedId === checklist.id 
                ? "border-primary bg-primary/5 shadow-sem-md scale-[1.02]" 
                : "border-border/10 hover:border-primary/30 hover:bg-muted/30"
            )}
            onClick={() => handleSelect(checklist.id)}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "p-3 rounded-xl shrink-0 transition-all duration-500",
                    selectedId === checklist.id 
                      ? "bg-primary text-white shadow-primary/20 shadow-lg" 
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-sem-label leading-tight tracking-tight">{checklist.title}</h4>
                    <p className="text-[11px] text-muted-foreground/60 leading-relaxed line-clamp-1 font-medium">{checklist.description}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg uppercase tracking-widest border border-primary/10">
                        {(checklist.groups?.reduce((acc, g) => acc + g.items.length, 0) || 0)} Itens (Norma ABNT)
                      </span>
                    </div>
                  </div>
                </div>
                {selectedId === checklist.id && (
                  <div className="p-1.5 bg-primary rounded-full text-white shrink-0 shadow-lg animate-in zoom-in duration-300">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Button 
        variant="ghost" 
        type="button" 
        size="sm"
        className="w-full border-2 border-dashed border-border/20 text-[10px] h-12 font-black uppercase tracking-widest active:scale-95 transition-all rounded-2xl hover:bg-primary/5 hover:border-primary/20 hover:text-primary"
        onClick={() => {
          if (window.confirm("As alterações não salvas serão perdidas. Deseja continuar para o gerenciamento de checklists?")) {
            window.location.href = "/admin/checklist";
          }
        }}
      >
        <Plus className="mr-2 h-4 w-4" /> 
        Customizar Modelos de Checklist
      </Button>
    </div>
  );
};

import { Plus } from "lucide-react";

