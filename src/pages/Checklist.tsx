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
import { FileText, PlayCircle, BarChart, ArrowLeft, CheckCircle2, Plus, Clock, Filter, History } from 'lucide-react';
import { PageHeader } from '@/components/Layout/PageHeader';
import { useToast } from "@/components/ui/use-toast";
import { StatsCard } from '@/components/shared/StatsCard';
import { cn } from '@/lib/utils';

interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  itemCount: number;
  isDefault: boolean;
  createdAt: Date;
  items: ChecklistItem[];
}

export default function Checklist() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'templates' | 'builder' | 'execution' | 'detail'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [executionItems, setExecutionItems] = useState<ChecklistItem[]>([]);

  const handleSelectTemplate = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setExecutionItems(template.items);
    setCurrentView('execution');
  };

  const handleCreateNew = () => {
    setCurrentView('builder');
  };

  const handleSaveChecklist = async (title: string, description: string, items: ChecklistItem[]) => {
    try {
      await checklistService.createTemplate({ title, description, items });
      toast({ title: "Template salvo", description: "O novo template de checklist foi criado com sucesso." });
      setCurrentView('templates');
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar o template.", variant: "destructive" });
    }
  };

  const handleSaveExecution = (completedItems: ChecklistItem[], notes: string) => {
    toast({ title: "Rascunho salvo", description: "O progresso da execução foi salvo localmente." });
    console.log('Salvando execução:', { completedItems, notes });
  };

  const handleSubmitExecution = (completedItems: ChecklistItem[], notes: string) => {
    toast({ title: "Checklist finalizado", description: "A execução foi registrada e sincronizada com o sistema." });
    console.log('Finalizando execução:', { completedItems, notes });
    
    // Log the activity
    if (selectedTemplate) {
      checklistService.logExecution(selectedTemplate.id, completedItems, notes);
    }
    
    setCurrentView('templates');
  };

  const handleBack = () => {
    setCurrentView('templates');
    setSelectedTemplate(null);
    setExecutionItems([]);
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
          <Button variant="outline" onClick={handleBack} className="rounded-xl h-10 font-bold active:scale-95 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="h-10 w-px bg-border/50 mx-2" />
          <div>
            <h2 className="text-h3 font-bold truncate">{selectedTemplate.name}</h2>
            <p className="text-sem-tiny text-muted-foreground uppercase font-bold tracking-tighter">Executando Checklist</p>
          </div>
        </div>
        <ChecklistExecution
          title={selectedTemplate.name}
          items={executionItems}
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
        title="Checklists"
        description="Gestão de templates padronizados e execução de inspeções técnicas."
      >
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => toast({ title: "Filtros", description: "Filtros avançados em breve." })} className="rounded-lg h-10 px-4">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button onClick={handleCreateNew} className="rounded-lg h-10 px-4 bg-primary">
            <Plus className="mr-2 h-4 w-4" />
            Novo Template
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Templates" value="3" icon={FileText} variant="brand" description="Modelos disponíveis" />
        <StatsCard label="Execuções" value="48" icon={PlayCircle} variant="progress" description="Este mês" />
        <StatsCard label="Finalizados" value="92%" icon={CheckCircle2} variant="complete" description="Taxa de sucesso" />
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
                  <div className="p-5 flex items-center justify-between hover:bg-primary/5 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-status-complete/10 text-status-complete rounded-xl border border-status-complete/20 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-base truncate group-hover:text-primary transition-colors">Vistoria Pré-Entrega - Unidade 204</p>
                        <p className="text-sem-tiny text-muted-foreground uppercase font-bold tracking-tighter flex items-center gap-1.5 mt-1">
                          <Clock size={12} /> Roberto Santos • Hoje às 10:30
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-status-complete/10 text-status-complete border-status-complete/20 rounded-lg text-sem-tiny font-black px-3 py-1">100% OK</Badge>
                  </div>
                  
                  <div className="p-5 flex items-center justify-between hover:bg-primary/5 transition-all cursor-pointer group border-b border-border/10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-status-pending/10 text-status-pending rounded-xl border border-status-pending/20 group-hover:scale-110 transition-transform">
                        <PlayCircle size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-base truncate group-hover:text-primary transition-colors">Manutenção Preventiva - Área Comum</p>
                        <p className="text-sem-tiny text-muted-foreground uppercase font-bold tracking-tighter flex items-center gap-1.5 mt-1">
                          <Clock size={12} /> Carlos Andrade • Ontem às 15:45
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-status-pending/10 text-status-pending border-status-pending/20 rounded-lg text-sem-tiny font-black px-3 py-1">EM ANDAMENTO</Badge>
                  </div>
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
