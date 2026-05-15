
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Upload, Camera, AlertCircle, ArrowLeft, ClipboardList, CheckCircle2 } from "lucide-react";
import { checklistService, ChecklistTemplate, ChecklistGroup, ChecklistItem } from "@/services/ChecklistService";
import { inspectionService } from "@/services/InspectionService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Load data
  React.useEffect(() => {
    const loadInspectionAndChecklist = () => {
      setLoading(true);
      const inspections = inspectionService.getAll();
      const inspection = inspections.find(i => i.id === inspectionId);
      
      const saved = localStorage.getItem(`inspection_progress_${inspectionId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setGroups(parsed);
          setLoading(false);
          return;
        } catch (e) {
          console.error("Failed to parse saved progress", e);
        }
      }

      if (inspection?.checklistId) {
        const template = checklistService.getTemplateById(inspection.checklistId);
        if (template) {
          if (template.groups) {
            setGroups(template.groups.map(g => ({
              ...g,
              items: g.items.map(item => ({
                ...item,
                conformity: item.conformity || "pending"
              }))
            })));
          } else if (template.items) {
            setGroups([{
              id: "default",
              name: "Geral",
              items: template.items.map(item => ({
                ...item,
                name: item.name || item.description,
                conformity: "pending"
              }))
            }]);
          }
        }
      }
      setLoading(false);
    };

    loadInspectionAndChecklist();
  }, [inspectionId]);

  // Persistent saving
  React.useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem(`inspection_progress_${inspectionId}`, JSON.stringify(groups));
    }
  }, [groups, inspectionId]);
  
  // Stats
  const allItems = groups.flatMap(g => g.items || []);
  const totalItems = allItems.length;
  const completedItems = allItems.filter(item => item.conformity && item.conformity !== "pending").length;
  const nonConformItems = allItems.filter(item => item.conformity === "nonconform");
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
  
  const handleReset = () => {
    if (window.confirm("Tem certeza que deseja limpar todo o progresso?")) {
      setGroups(prev => prev.map(g => ({
        ...g,
        items: g.items.map(i => ({ ...i, conformity: "pending", notes: "" }))
      })));
      localStorage.removeItem(`inspection_progress_${inspectionId}`);
      setCurrentGroupIndex(0);
      setShowSummary(false);
    }
  };

  const handleSubmit = () => {
    if (!signature.trim()) {
      toast({
        title: "Assinatura necessária",
        description: "Por favor, informe seu nome para confirmar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      toast({
        title: "Vistoria finalizada!",
        description: `Enviado com sucesso. Assinado por: ${signature}`,
      });
      
      inspectionService.updateStatus(inspectionId, "complete");
      localStorage.removeItem(`inspection_progress_${inspectionId}`);
      
      if (onComplete) {
        onComplete({
          inspectionId,
          groups,
          nonConformCount: nonConformItems.length,
          signature
        });
      }
      setIsSubmitting(false);
    }, 1000);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium">Carregando...</p>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowSummary(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <h2 className="text-xl font-bold">Resumo da Vistoria</h2>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Status Final</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background p-3 rounded-lg border">
                <p className="text-xs text-muted-foreground uppercase">Itens Conformes</p>
                <p className="text-2xl font-bold text-green-600">{allItems.filter(i => i.conformity === "conform").length}</p>
              </div>
              <div className="bg-background p-3 rounded-lg border">
                <p className="text-xs text-muted-foreground uppercase">Não Conformes</p>
                <p className="text-2xl font-bold text-red-600">{nonConformItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {nonConformItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" /> Itens Não Conformes
            </h3>
            <div className="space-y-2">
              {nonConformItems.map(item => (
                <div key={item.id} className="p-3 border-l-4 border-l-red-500 bg-red-50 rounded-r-lg">
                  <p className="font-bold text-sm text-red-900">{item.name || item.description}</p>
                  {item.notes && <p className="text-xs text-red-700 mt-1 italic">"{item.notes}"</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Assinatura Digital</CardTitle>
            <CardDescription>Confirme a realização da vistoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signature">Nome Completo</Label>
              <Input 
                id="signature" 
                placeholder="Digite seu nome para assinar" 
                value={signature}
                onChange={e => setSignature(e.target.value)}
              />
            </div>
            <Button 
              className="w-full h-12 text-lg font-bold" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Finalizando..." : "Confirmar e Enviar"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentGroup = groups[currentGroupIndex];
  const isLastGroup = currentGroupIndex === groups.length - 1;

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-xl border border-border/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold uppercase text-primary tracking-widest">Progresso: {progress}%</span>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs text-destructive hover:bg-destructive/10">
            Resetar
          </Button>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {groups.map((g, idx) => {
          const groupDone = g.items.every(i => i.conformity !== "pending");
          return (
            <Button
              key={g.id}
              variant={currentGroupIndex === idx ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentGroupIndex(idx)}
              className={cn("whitespace-nowrap rounded-full", groupDone && "border-green-500")}
            >
              {groupDone && <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />}
              {g.name}
            </Button>
          );
        })}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">{currentGroup.name}</h2>
        {currentGroup.items.map(item => (
          <Card key={item.id} className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <span className="font-semibold text-sm leading-tight">{item.name || item.description}</span>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant={item.conformity === "conform" ? "default" : "outline"}
                    className={item.conformity === "conform" ? "bg-green-600 hover:bg-green-700" : "hover:border-green-500 hover:text-green-600"}
                    onClick={() => handleConformityChange(currentGroup.id, item.id, "conform")}
                  >
                    <Check className="h-3 w-3 mr-1" /> OK
                  </Button>
                  <Button
                    size="sm"
                    variant={item.conformity === "nonconform" ? "default" : "outline"}
                    className={item.conformity === "nonconform" ? "bg-red-600 hover:bg-red-700" : "hover:border-red-500 hover:text-red-600"}
                    onClick={() => handleConformityChange(currentGroup.id, item.id, "nonconform")}
                  >
                    <X className="h-3 w-3 mr-1" /> Falha
                  </Button>
                </div>
              </div>

              {item.conformity !== "pending" && (
                <div className="animate-in slide-in-from-top-2 duration-200 space-y-2">
                  <Textarea
                    placeholder="Observações (opcional)"
                    className="text-xs min-h-[60px]"
                    value={item.notes || ""}
                    onChange={e => handleNotesChange(currentGroup.id, item.id, e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t sticky bottom-0 bg-background/80 backdrop-blur-sm py-4">
        <Button 
          variant="outline" 
          onClick={() => setCurrentGroupIndex(prev => prev - 1)}
          disabled={currentGroupIndex === 0}
        >
          Anterior
        </Button>
        {isLastGroup ? (
          <Button 
            className="bg-primary hover:bg-primary/90 font-bold"
            disabled={completedItems < totalItems}
            onClick={() => setShowSummary(true)}
          >
            Revisar e Finalizar
          </Button>
        ) : (
          <Button onClick={() => setCurrentGroupIndex(prev => prev + 1)}>
            Próximo
          </Button>
        )}
      </div>
    </div>
  );
};
