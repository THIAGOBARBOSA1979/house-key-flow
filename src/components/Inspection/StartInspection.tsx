
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks";
import { checklistService, ChecklistGroup } from "@/services";
import { inspectionService } from "@/services";
import { documentService } from "@/services";
import { ChecklistProgress } from "./Checklist/ChecklistProgress";
import { ChecklistGroupTabs } from "./Checklist/ChecklistGroupTabs";
import { ChecklistItemCard } from "./Checklist/ChecklistItemCard";
import { InspectionSummary } from "./Checklist/InspectionSummary";
import { InspectionDraftService } from "@/services/operations/InspectionDraftService";
import { useAuth } from "@/contexts/AuthContext";


export const StartInspection = ({ 
  inspectionId, 
  onComplete 
}: { 
  inspectionId: string; 
  onComplete?: (data: any) => void;
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [signature, setSignature] = useState("");

  const [extraNotes, setExtraNotes] = useState("");
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Load data
  React.useEffect(() => {
    const loadInspectionAndChecklist = async () => {
      setLoading(true);
      const inspections = inspectionService.getAll();
      const inspection = inspections.find(i => i.id === inspectionId);
      
      if (user) {
        const saved = await InspectionDraftService.getDraft(inspectionId, user.id);
        if (saved) {
          setGroups(saved);
          setLoading(false);
          return;
        }
      }

      if (inspection?.checklistId) {
        const template = checklistService.getTemplateById(inspection.checklistId);
        if (template && template.groups) {
          setGroups(template.groups.map(g => ({
            ...g,
            items: g.items.map(item => ({
              ...item,
              conformity: item.conformity || "pending"
            }))
          })));
        } else {
          setGroups([{ id: "default", name: "Geral", items: [] }]);
        }
      }
      setLoading(false);
    };

    loadInspectionAndChecklist();

  }, [inspectionId]);

  // Persistent saving
  React.useEffect(() => {
    if (groups.length > 0 && user) {
      InspectionDraftService.saveDraft(inspectionId, user.id, groups);
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
                item.id === itemId ? { ...item, conformity: value } : item
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
                item.id === itemId ? { ...item, notes } : item
              )
            }
          : group
      )
    );
  };
  
  const handleReset = () => {
    if (window.confirm("Tem certeza que deseja limpar todo o progresso técnico coletado até agora?")) {
      setGroups(prev => prev.map(g => ({
        ...g,
        items: g.items.map(i => ({ ...i, conformity: "pending", notes: "" }))
      })));
      if (user) InspectionDraftService.clearDraft(inspectionId, user.id);

      setCurrentGroupIndex(0);
      setShowSummary(false);
    }
  };

  const handleSubmit = () => {
    if (!signature.trim()) {
      toast({
        title: "Assinatura necessária",
        description: "Por favor, informe o nome do responsável técnico para assinar o laudo.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    const runSubmission = async () => {
      try {
        const nonConformCount = nonConformItems.length;
        const inspection = inspectionService.getAll().find(i => i.id === inspectionId);
        const totalCount = totalItems || 1;
        const conformityScore = Math.round(((totalCount - nonConformCount) / totalCount) * 100);
        
        const completionDetails = `Vistoria finalizada por ${signature}. Itens conformes: ${totalItems - nonConformCount}/${totalItems}. Score de Conformidade: ${conformityScore}%.`;
        
        await inspectionService.update(inspectionId, { 
          status: "complete", 
          notes: (inspection?.notes || "") + "\n" + completionDetails,
          conformityScore,
          nonConformitiesFound: nonConformCount
        });

        const doc = await documentService.createDocument({
          title: `Relatório de Vistoria - ${inspection?.property || 'Unidade'}`,
          type: "auto",
          category: "relatorio",
          description: `Relatório técnico estruturado após vistoria finalizada em ${new Date().toLocaleDateString()}.`,
          priority: "medium",
          associatedTo: { property: inspection?.property, client: inspection?.client },
          visible: true,
          status: "published",
          createdBy: signature,
          template: `LAUDO TÉCNICO DE VISTORIA\n\nEMPREENDIMENTO: ${inspection?.property || 'N/A'}\nCLIENTE: ${inspection?.client || 'N/A'}\nDATA: ${new Date().toLocaleDateString()}\nRESPONSÁVEL: ${signature}\n\nRESUMO:\n- Total de itens verificados: ${totalItems}\n- Itens em conformidade: ${totalItems - nonConformCount}\n- Não conformidades detectadas: ${nonConformCount}\n\nNOTAS GERAIS:\n${extraNotes || 'Nenhuma observação extra.'}\n\nITENS COM FALHA:\n${nonConformItems.map(i => `- ${i.name || i.description}: ${i.notes || 'Sem observações'}`).join('\n')}`
        });

        await documentService.addSigner(doc.id, { name: signature, email: "engenheiro@a2.com", role: "Engenheiro Responsável", confirmationMethod: "email", order: 1 });
        if (inspection?.client) {
          await documentService.addSigner(doc.id, { name: inspection.client, email: "cliente@exemplo.com", role: "Cliente / Comprador", confirmationMethod: "email", order: 2 });
        }

        toast({ title: "Vistoria homologada com sucesso!", description: `Relatório gerado e enviado para assinaturas digitais.` });
        if (user) await InspectionDraftService.clearDraft(inspectionId, user.id);
        
        if (onComplete) {
          onComplete({ inspectionId, completedAt: new Date(), groups, nonConformCount, signature });
        }
      } catch (err) {
        console.error("Submission error", err);
        toast({ title: "Erro na finalização", description: "Não foi possível salvar os dados da vistoria.", variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    };

    runSubmission();
  };

  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-bold tracking-tight">Sincronizando dados técnicos...</p>
      </div>
    );
  }

  if (showSummary) {
    return (
      <InspectionSummary 
        totalItems={totalItems}
        conformCount={totalItems - nonConformItems.length}
        nonConformItems={nonConformItems}
        extraNotes={extraNotes}
        onExtraNotesChange={setExtraNotes}
        signature={signature}
        onSignatureChange={setSignature}
        onBack={() => setShowSummary(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  const currentGroup = groups[currentGroupIndex];
  const isLastGroup = currentGroupIndex === groups.length - 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ChecklistProgress progress={progress} onReset={handleReset} />

      <ChecklistGroupTabs 
        groups={groups} 
        currentIndex={currentGroupIndex} 
        onSelect={setCurrentGroupIndex} 
      />

      <div className="space-y-4 min-h-[300px]">
        <h2 className="text-xl font-bold text-foreground/90 flex items-center gap-2">
          {currentGroup.name}
          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold text-muted-foreground">
            {currentGroup.items.length} ITENS
          </span>
        </h2>
        {currentGroup.items.map(item => (
          <ChecklistItemCard 
            key={item.id}
            item={item}
            inspectionId={inspectionId}
            onConformityChange={(val) => handleConformityChange(currentGroup.id, item.id, val)}
            onNotesChange={(notes) => handleNotesChange(currentGroup.id, item.id, notes)}
            onPhotosChange={(photos) => {
              setGroups(prevGroups => 
                prevGroups.map(group => 
                  group.id === currentGroup.id 
                    ? {
                        ...group,
                        items: group.items.map(i => 
                          i.id === item.id ? { ...i, photos } : i
                        )
                      }
                    : group
                )
              );
            }}
          />

        ))}
      </div>

      <div className="flex justify-between pt-6 border-t sticky bottom-0 bg-background/95 backdrop-blur-md py-4 z-10">
        <Button 
          variant="outline" 
          onClick={() => setCurrentGroupIndex(prev => prev - 1)}
          disabled={currentGroupIndex === 0}
          className="rounded-xl h-11 px-6 font-bold"
        >
          Anterior
        </Button>
        {isLastGroup ? (
          <Button 
            className="bg-primary hover:bg-primary/90 font-bold h-11 px-8 rounded-xl shadow-lg transition-all active:scale-95"
            disabled={completedItems < totalItems}
            onClick={() => setShowSummary(true)}
          >
            Revisar Protocolo
          </Button>
        ) : (
          <Button 
            onClick={() => setCurrentGroupIndex(prev => prev + 1)}
            className="h-11 px-8 rounded-xl font-bold transition-all active:scale-95"
          >
            Próxima Seção
          </Button>
        )}
      </div>
    </div>
  );
};
