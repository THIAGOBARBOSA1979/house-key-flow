
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Upload, Camera, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { checklistService, ChecklistTemplate, ChecklistGroup } from "@/services/ChecklistService";
import { inspectionService } from "@/services/InspectionService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InspectionItem = {
  id: string;
  name: string;
  conformity: "pending" | "conform" | "nonconform";
  notes?: string;
  attachments?: string[];
};

type InspectionGroup = ChecklistGroup;

// Example data for an inspection checklist
const mockInspectionData: ChecklistGroup[] = [
  {
    id: "g1",
    name: "Paredes e Tetos",
    items: [
      { id: "item1", name: "Acabamento das paredes (pintura, textura)", description: "Acabamento das paredes (pintura, textura)", required: true, conformity: "pending" },
      { id: "item2", name: "Ausência de trincas ou rachaduras", description: "Ausência de trincas ou rachaduras", required: true, conformity: "pending" },
      { id: "item3", name: "Alinhamento de paredes e teto", description: "Alinhamento de paredes e teto", required: true, conformity: "pending" }
    ]
  },
  {
    id: "g2",
    name: "Instalações Hidráulicas",
    items: [
      { id: "item4", name: "Funcionamento de torneiras", description: "Funcionamento de torneiras", required: true, conformity: "pending" },
      { id: "item5", name: "Vazamentos em conexões", description: "Vazamentos em conexões", required: true, conformity: "pending" },
      { id: "item6", name: "Escoamento de águas", description: "Escoamento de águas", required: true, conformity: "pending" }
    ]
  },
  {
    id: "g3",
    name: "Instalações Elétricas",
    items: [
      { id: "item7", name: "Funcionamento de interruptores", description: "Funcionamento de interruptores", required: true, conformity: "pending" },
      { id: "item8", name: "Tomadas energizadas", description: "Tomadas energizadas", required: true, conformity: "pending" },
      { id: "item9", name: "Iluminação em funcionamento", description: "Iluminação em funcionamento", required: true, conformity: "pending" }
    ]
  }
];

export const StartInspection = ({ 
  inspectionId, 
  onComplete 
}: { 
  inspectionId: string; 
  onComplete?: (data: any) => void;
}) => {
  const { toast } = useToast();
  const [signature, setSignature] = useState("");
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadInspectionAndChecklist = () => {
      setLoading(true);
      const inspections = inspectionService.getAll();
      const inspection = inspections.find(i => i.id === inspectionId);
      
      const saved = localStorage.getItem(`inspection_progress_${inspectionId}`);
      if (saved) {
        try {
          setGroups(JSON.parse(saved));
          setLoading(false);
          return;
        } catch (e) {
          console.error("Failed to parse saved progress", e);
        }
      }

      if (inspection?.checklistId) {
        const template = checklistService.getTemplateById(inspection.checklistId);
        if (template) {
          // Adapt template to groups if necessary
          if (template.groups) {
            setGroups(template.groups);
          } else if (template.items) {
            setGroups([{
              id: "default",
              name: "Geral",
              items: template.items.map(item => ({
                ...item,
                name: item.description,
                conformity: "pending" as const
              }))
            }]);
          }
        } else {
          setGroups(mockInspectionData as any);
        }
      } else {
        setGroups(mockInspectionData as any);
      }
      setLoading(false);
    };

    loadInspectionAndChecklist();
  }, [inspectionId]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save progress whenever groups change
  React.useEffect(() => {
    localStorage.setItem(`inspection_progress_${inspectionId}`, JSON.stringify(groups));
  }, [groups, inspectionId]);
  
  // Calculate progress
  const totalItems = groups.reduce((acc, group) => acc + (group.items?.length || 0), 0);
  const completedItems = groups.reduce((acc, group) => 
    acc + (group.items?.filter(item => item.conformity && item.conformity !== "pending").length || 0), 0);
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  const handleConformityChange = (groupId: string, itemId: string, value: "conform" | "nonconform") => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId 
          ? {
              ...group,
              items: group.items.map(item => 
                item.id === itemId 
                  ? { ...item, conformity: value }
                  : item
              )
            }
          : group
      )
    );
  };
  
  const handleNotesChange = (groupId: string, itemId: string, notes: string) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId 
          ? {
              ...group,
              items: group.items.map(item => 
                item.id === itemId 
                  ? { ...item, notes }
                  : item
              )
            }
          : group
      )
    );
  };
  
  const handleAddAttachment = (groupId: string, itemId: string) => {
    // In a real app, you would upload files here
    toast({
      title: "Funcionalidade simulada",
      description: "Em um app real, isso abriria o seletor de arquivos.",
    });
  };
  
  const handleReset = () => {
    if (window.confirm("Tem certeza que deseja limpar todo o progresso desta vistoria?")) {
      setGroups(mockInspectionData);
      localStorage.removeItem(`inspection_progress_${inspectionId}`);
      setCurrentGroupIndex(0);
      toast({
        title: "Progresso resetado",
        description: "Todos os itens voltaram ao estado pendente.",
      });
    }
  };

  const handleSubmit = () => {
    if (!signature.trim()) {
      toast({
        title: "Assinatura necessária",
        description: "Por favor, informe seu nome para assinar a vistoria.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Check if all items have been evaluated
    const allCompleted = groups.every(group => 
      group.items.every(item => item.conformity && item.conformity !== "pending")
    );
    
    if (!allCompleted) {
      toast({
        title: "Verificação incompleta",
        description: "Por favor, verifique todos os itens antes de finalizar.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    // Count non-conforming items
    const nonConformCount = groups.reduce((acc, group) => 
      acc + group.items.filter(item => item.conformity === "nonconform").length, 0);
    
    // Simulate submission to backend
    setTimeout(() => {
      toast({
        title: "Vistoria finalizada com sucesso!",
        description: `${nonConformCount} itens necessitam de atenção. Assinado por: ${signature}`,
      });
      
      localStorage.removeItem(`inspection_progress_${inspectionId}`);
      
      if (nonConformCount > 0) {
        toast({
          title: "Solicitações de serviço geradas",
          description: `Foram geradas ${nonConformCount} solicitações de serviço automaticamente.`,
        });
      }
      
      if (onComplete) {
        onComplete({
          inspectionId,
          completedAt: new Date(),
          groups,
          nonConformCount
        });
      }
      
      setIsSubmitting(false);
    }, 1500);
  };
  
  const currentGroup = groups[currentGroupIndex];
  
  // Navigation between groups
  const goToNextGroup = () => {
    if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const goToPreviousGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
      window.scrollTo(0, 0);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium">Carregando checklist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/10">
        <div className="flex justify-between items-center text-sm">
          <div className="flex flex-col">
            <span className="font-bold text-primary uppercase text-[10px] tracking-widest mb-1">Status da Vistoria</span>
            <span className="text-muted-foreground font-medium">{progress}% concluído ({completedItems}/{totalItems} itens)</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 font-bold uppercase tracking-tighter">
            Resetar
          </Button>
        </div>
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Group navigation */}
      <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 sm:flex-wrap sm:overflow-visible no-scrollbar">
        {groups.map((group, index) => {
          const groupCompletedItems = group.items.filter(item => item.conformity !== "pending").length;
          const isComplete = groupCompletedItems === group.items.length;
          
          return (
            <Button 
              key={group.id} 
              variant={currentGroupIndex === index ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentGroupIndex(index)}
              className={isComplete ? "border-green-500" : ""}
            >
              {isComplete && <Check className="h-3 w-3 mr-1" />}
              {group.name}
            </Button>
          );
        })}
      </div>
      
      {/* Current group items */}
      <Card>
        <CardHeader>
          <CardTitle>{currentGroup.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentGroup.items?.map(item => (
            <div key={item.id} className="border rounded-md p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <h4 className="font-bold text-sm text-foreground/90">{item.name || item.description}</h4>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={item.conformity === "conform" ? "default" : "outline"}
                    className={item.conformity === "conform" ? "bg-green-600" : ""}
                    onClick={() => handleConformityChange(currentGroup.id, item.id, "conform")}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Conforme
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={item.conformity === "nonconform" ? "default" : "outline"}
                    className={item.conformity === "nonconform" ? "bg-red-600" : ""}
                    onClick={() => handleConformityChange(currentGroup.id, item.id, "nonconform")}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Não Conforme
                  </Button>
                </div>
              </div>
              
              {item.conformity !== "pending" && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor={`notes-${item.id}`} className="text-sm font-medium block mb-1">
                      Observações
                    </label>
                    <Textarea
                      id={`notes-${item.id}`}
                      placeholder="Adicione observações sobre este item..."
                      value={item.notes || ""}
                      onChange={(e) => handleNotesChange(currentGroup.id, item.id, e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Anexos
                    </label>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddAttachment(currentGroup.id, item.id)}
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        Adicionar foto
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddAttachment(currentGroup.id, item.id)}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Enviar arquivo
                      </Button>
                    </div>
                  </div>
                  
                  {item.conformity === "nonconform" && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800">Item não conforme</p>
                        <p className="text-amber-700">Uma solicitação de serviço será gerada automaticamente ao finalizar a vistoria.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={goToPreviousGroup}
          disabled={currentGroupIndex === 0}
        >
          Grupo anterior
        </Button>
        
        {currentGroupIndex < groups.length - 1 ? (
          <Button 
            type="button"
            onClick={goToNextGroup}
          >
            Próximo grupo
          </Button>
        ) : (
          <div className="flex flex-col gap-4 w-full sm:w-auto">
            <div className="flex flex-col gap-2">
              <Label htmlFor="signature" className="text-xs font-bold uppercase">Assinatura do Técnico/Cliente</Label>
              <Input 
                id="signature"
                placeholder="Nome completo para assinatura" 
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <Button 
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 font-bold"
            >
              {isSubmitting ? "Enviando..." : "Finalizar vistoria"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
