import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChecklistBuilder } from '@/components/Checklists/ChecklistBuilder';
import { ChecklistDetail } from '@/components/Checklists/ChecklistDetail';
import { ChecklistTemplates } from '@/components/Checklists/ChecklistTemplates';
import { ChecklistExecution } from '@/components/Checklists/ChecklistExecution';
import { ChecklistItem, ChecklistService } from '@/services/ChecklistService';
import { FileText, PlayCircle, BarChart, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/Layout/PageHeader';
import { useToast } from "@/components/ui/use-toast";

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
      await ChecklistService.createChecklist(items, { title, description });
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
    setCurrentView('templates');
  };

  const handleBack = () => {
    setCurrentView('templates');
    setSelectedTemplate(null);
    setExecutionItems([]);
  };

  if (currentView === 'builder') {
    return (
      <div className="space-y-6">
        <ChecklistBuilder
          onSave={handleSaveChecklist}
          onCancel={handleBack}
        />
      </div>
    );
  }

  if (currentView === 'execution' && selectedTemplate) {
    return (
      <div className="space-y-6">
        <div>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Templates
          </Button>
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
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Checklists"
        description="Gerencie templates e execute checklists de inspeção"
      />

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="executions">
            <PlayCircle className="h-4 w-4 mr-2" />
            Execuções
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <ChecklistTemplates
            onSelectTemplate={handleSelectTemplate}
            onCreateNew={handleCreateNew}
          />
        </TabsContent>

        <TabsContent value="executions">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Execuções Recentes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Vistoria Pré-Entrega - Unidade 204</p>
                        <p className="text-xs text-muted-foreground">Executado por: Roberto Santos • Hoje às 10:30</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700">100% OK</Badge>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Manutenção Preventiva - Área Comum</p>
                        <p className="text-xs text-muted-foreground">Executado por: Carlos Andrade • Ontem às 15:45</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">85% OK</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Templates Criados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Total de templates</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Execuções Este Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Checklists executados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Conclusão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground">Média de conclusão</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
