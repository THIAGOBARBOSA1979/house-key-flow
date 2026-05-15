
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Upload, Camera, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";

type InspectionItem = {
  id: string;
  name: string;
  conformity: "pending" | "conform" | "nonconform";
  notes?: string;
  attachments?: string[];
};

type InspectionGroup = {
  id: string;
  name: string;
  items: InspectionItem[];
};

// Example data for an inspection checklist
const mockInspectionData: InspectionGroup[] = [
  {
    id: "g1",
    name: "Paredes e Tetos",
    items: [
      { id: "item1", name: "Acabamento das paredes (pintura, textura)", conformity: "pending" },
      { id: "item2", name: "Ausência de trincas ou rachaduras", conformity: "pending" },
      { id: "item3", name: "Alinhamento de paredes e teto", conformity: "pending" }
    ]
  },
  {
    id: "g2",
    name: "Instalações Hidráulicas",
    items: [
      { id: "item4", name: "Funcionamento de torneiras", conformity: "pending" },
      { id: "item5", name: "Vazamentos em conexões", conformity: "pending" },
      { id: "item6", name: "Escoamento de águas", conformity: "pending" }
    ]
  },
  {
    id: "g3",
    name: "Instalações Elétricas",
    items: [
      { id: "item7", name: "Funcionamento de interruptores", conformity: "pending" },
      { id: "item8", name: "Tomadas energizadas", conformity: "pending" },
      { id: "item9", name: "Iluminação em funcionamento", conformity: "pending" }
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
  const [groups, setGroups] = useState<InspectionGroup[]>(() => {
    const saved = localStorage.getItem(`inspection_progress_${inspectionId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved progress", e);
      }
    }
    return mockInspectionData;
  });
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save progress whenever groups change
  React.useEffect(() => {
    localStorage.setItem(`inspection_progress_${inspectionId}`, JSON.stringify(groups));
  }, [groups, inspectionId]);
  
  // Calculate progress
  const totalItems = groups.reduce((acc, group) => acc + group.items.length, 0);
  const completedItems = groups.reduce((acc, group) => 
    acc + group.items.filter(item => item.conformity !== "pending").length, 0);
  const progress = Math.round((completedItems / totalItems) * 100);
  
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
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Check if all items have been evaluated
    const allCompleted = groups.every(group => 
      group.items.every(item => item.conformity !== "pending")
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
        description: `${nonConformCount} itens necessitam de atenção.`,
      });
      
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
  
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progresso: {progress}%</span>
          <span>{completedItems}/{totalItems} itens verificados</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Group navigation */}
      <div className="flex flex-wrap gap-2">
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
          {currentGroup.items.map(item => (
            <div key={item.id} className="border rounded-md p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h4 className="font-medium">{item.name}</h4>
                
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
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Finalizar vistoria"}
          </Button>
        )}
      </div>
    </div>
  );
};
