import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChecklistBuilder } from '@/components/Checklists/ChecklistBuilder';
import { ChecklistDetail } from '@/components/Checklists/ChecklistDetail';
import { ChecklistTemplates } from '@/components/Checklists/ChecklistTemplates';
import { ChecklistExecution } from '@/components/Checklists/ChecklistExecution';
import { ChecklistItem, checklistService } from '@/services/ChecklistService';
import { FileText, PlayCircle, BarChart, ArrowLeft, CheckCircle2, Plus, Clock, Filter, History, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/Layout/PageHeader';
import { useToast } from "@/components/ui/use-toast";
import { StatsCard } from '@/components/shared/StatsCard';
import { cn } from '@/lib/utils';

import { ChecklistTemplate } from '@/services/ChecklistService';

export default function Checklist() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'templates' | 'builder' | 'execution' | 'detail'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [executionGroups, setExecutionGroups] = useState<ChecklistGroup[]>([]);

  const handleSelectTemplate = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setExecutionGroups(template.groups || []);
    setCurrentView('execution');
  };

  const handleCreateNew = () => {
    setCurrentView('builder');
  };

  const handleSaveChecklist = async (title: string, description: string, groups: ChecklistGroup[]) => {
    try {
      await checklistService.createTemplate({ 
        title, 
        description, 
        groups,
        category: "vistoria" 
      });
      toast({ title: "Template salvo", description: "O novo template de checklist foi criado com sucesso." });
      setCurrentView('templates');
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar o template.", variant: "destructive" });
    }
  };

  const handleSaveExecution = (completedGroups: ChecklistGroup[], notes: string) => {
    if (selectedTemplate) {
      checklistService.logExecution(selectedTemplate.id, completedGroups, notes, undefined, "in_progress");
      toast({ title: "Rascunho salvo", description: "O progresso da vistoria foi persistido." });
    }
  };


  const handleSubmitExecution = (completedGroups: ChecklistGroup[], notes: string) => {
    toast({ title: "Vistoria finalizada", description: "A inspeção foi registrada com sucesso e o laudo técnico gerado." });
    
    // Log the activity
    if (selectedTemplate) {
      checklistService.logExecution(selectedTemplate.id, completedGroups, notes, undefined, "completed");
    }
    
    setCurrentView('templates');
  };


  const handleBack = () => {
    setCurrentView('templates');
    setSelectedTemplate(null);
    setExecutionGroups([]);
  };

  if (currentView === 'builder') {
    return (
      <div className="space-y-6 animate-fade-in">
        <ChecklistBuilder
          onSave={handleSaveChecklist}
          onCancel={handleBack}
        />
      </div>
    );
  }

  if (currentView === 'execution' && selectedTemplate) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack} className="rounded-xl h-10 font-bold active:scale-95 transition-all border-primary/20 hover:border-primary/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="h-10 w-px bg-border/50 mx-2" />
          <div>
            <h2 className="text-h3 font-bold truncate">{selectedTemplate.title}</h2>
            <p className="text-sem-tiny text-muted-foreground uppercase font-bold tracking-tighter">Executando Checklist</p>
          </div>
        </div>
        <ChecklistExecution
          title={selectedTemplate.title}
          items={executionGroups as any}
          onSave={handleSaveExecution}
          onSubmit={handleSubmitExecution}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        icon={FileText}
        title="Gestão de Checklists"
        description="Templates padronizados e vistorias técnicas com conformidade em tempo real."
      >
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => toast({ title: "Exportar", description: "Relatório gerencial em PDF sendo gerado..." })} className="rounded-xl h-10 px-4 font-bold border-primary/20 hover:border-primary/50">
            Relatório Geral
          </Button>
          <Button onClick={handleCreateNew} className="rounded-xl h-10 px-4 bg-primary font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <Plus className="mr-2 h-4 w-4" />
            Novo Template
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Modelos" value={checklistService.getAllTemplates().length.toString()} icon={FileText} variant="brand" description="Templates ativos" />
        <StatsCard label="Vistorias" value={checklistService.getAllExecutions().length.toString()} icon={PlayCircle} variant="progress" description="Execuções totais" />
        <StatsCard label="Conformidade" value="88.5%" icon={CheckCircle2} variant="complete" description="Média técnica" />
        <StatsCard label="Pendências" value="14" icon={AlertCircle} variant="critical" description="Itens não conformes" />
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-full max-w-lg">
          <TabsTrigger value="templates" className="rounded-lg py-2.5 font-bold text-xs gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="executions" className="rounded-lg py-2.5 font-bold text-xs gap-2">
            <History className="h-4 w-4" />
            Execuções
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg py-2.5 font-bold text-xs gap-2">
            <BarChart className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <ChecklistTemplates
            onSelectTemplate={handleSelectTemplate}
            onCreateNew={handleCreateNew}
          />
        </TabsContent>

        <TabsContent value="executions" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <div className="grid gap-4">
            <Card className="card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-2 border-b border-border/10">
                <CardTitle className="text-h4">Execuções Recentes</CardTitle>
                <CardDescription>Acompanhamento em tempo real das inspeções em campo.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/10">
                  {checklistService.getAllExecutions().length > 0 ? (
                    checklistService.getAllExecutions().map((exec) => (
                      <div key={exec.id} className="p-5 flex items-center justify-between hover:bg-primary/5 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-3 rounded-xl border group-hover:scale-110 transition-transform",
                            exec.conformityRate === 100 
                              ? "bg-status-complete/10 text-status-complete border-status-complete/20"
                              : "bg-status-pending/10 text-status-pending border-status-pending/20"
                          )}>
                            {exec.conformityRate === 100 ? <CheckCircle2 size={20} /> : <PlayCircle size={20} />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-base truncate group-hover:text-primary transition-colors">{exec.templateTitle}</p>
                            <p className="text-sem-tiny text-muted-foreground uppercase font-bold tracking-tighter flex items-center gap-1.5 mt-1">
                              <Clock size={12} /> {exec.performedByName} • {new Date(exec.date).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn(
                          "rounded-lg text-sem-tiny font-black px-3 py-1",
                          exec.conformityRate === 100 
                            ? "bg-status-complete/10 text-status-complete border-status-complete/20"
                            : "bg-status-pending/10 text-status-pending border-status-pending/20"
                        )}>
                          {exec.conformityRate}% OK
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-muted-foreground">
                      <History size={48} className="mx-auto opacity-20 mb-3" />
                      <p className="italic">Nenhuma execução registrada.</p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-muted/20 text-center">
                   <Button variant="ghost" size="sm" className="text-tiny font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
                    Ver histórico completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-normal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-standard bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-h4">Frequência de Uso</CardTitle>
                <CardDescription>Execuções por categoria de checklist</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground italic font-medium">
                Gráfico de frequência em tempo real
              </CardContent>
            </Card>
            <Card className="card-standard bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-h4">Qualidade Técnica</CardTitle>
                <CardDescription>Conformidade média por empreendimento</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground italic font-medium">
                Índice de conformidade (KPI)
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
