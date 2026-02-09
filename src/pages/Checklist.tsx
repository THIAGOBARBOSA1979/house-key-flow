import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChecklistBuilder } from '@/components/Checklists/ChecklistBuilder';
import { ChecklistDetail } from '@/components/Checklists/ChecklistDetail';
import { ChecklistTemplates } from '@/components/Checklists/ChecklistTemplates';
import { ChecklistExecution } from '@/components/Checklists/ChecklistExecution';
import { ChecklistItem, ChecklistService } from '@/services/ChecklistService';
import { FileText, PlayCircle, BarChart, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/Layout/PageHeader';

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
      setCurrentView('templates');
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
    }
  };

  const handleSaveExecution = (completedItems: ChecklistItem[], notes: string) => {
    console.log('Salvando execução:', { completedItems, notes });
  };

  const handleSubmitExecution = (completedItems: ChecklistItem[], notes: string) => {
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
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma execução de checklist registrada
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
