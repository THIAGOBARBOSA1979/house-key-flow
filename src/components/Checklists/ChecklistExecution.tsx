
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChecklistItem } from "@/services/ChecklistService";
import { Check, X, AlertCircle, Camera, Save, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistExecutionProps {
  title: string;
  items: ChecklistItem[];
  onSave: (completedItems: ChecklistItem[], notes: string) => void;
  onSubmit: (completedItems: ChecklistItem[], notes: string) => void;
  readOnly?: boolean;
}

export function ChecklistExecution({ 
  title, 
  items, 
  onSave, 
  onSubmit, 
  readOnly = false 
}: ChecklistExecutionProps) {
  const [completedItems, setCompletedItems] = useState<ChecklistItem[]>(items);
  const [notes, setNotes] = useState("");
  const [currentSection, setCurrentSection] = useState(0);

  // Agrupar itens por categoria
  const groupedItems = completedItems.reduce((acc, item) => {
    let category = "Outros";
    const match = item.description.match(/^([^:]+):\s(.+)$/);
    
    if (match) {
      category = match[1];
    }
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const sections = Object.keys(groupedItems);
  const totalItems = completedItems.length;
  const completedCount = completedItems.filter(item => item.status && item.status !== 'na').length;
  const progressPercentage = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  const handleItemStatusChange = (itemId: string, status: 'ok' | 'issue' | 'na') => {
    setCompletedItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, status } : item
      )
    );
  };

  const handleFileUpload = (itemId: string, files: FileList | null) => {
    if (!files) return;
    
    setCompletedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, evidence: Array.from(files) }
          : item
      )
    );
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ok': return 'text-green-600 bg-green-100';
      case 'issue': return 'text-red-600 bg-red-100';
      case 'na': return 'text-gray-600 bg-gray-100';
      default: return 'text-amber-600 bg-amber-100';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'ok': return 'OK';
      case 'issue': return 'Problema';
      case 'na': return 'N/A';
      default: return 'Pendente';
    }
  };

  const currentSectionItems = groupedItems[sections[currentSection]] || [];

  return (
    <div className="space-y-6">
      {/* Header com progresso */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {completedCount} de {totalItems} itens verificados
              </p>
            </div>
            <Badge variant="outline">
              {Math.round(progressPercentage)}% completo
            </Badge>
          </div>
          <Progress value={progressPercentage} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Navegação por seções */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((section, index) => (
          <Button
            key={section}
            variant={currentSection === index ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentSection(index)}
            className="whitespace-nowrap"
          >
            {section}
            <Badge variant="secondary" className="ml-2">
              {groupedItems[section].filter(item => item.status && item.status !== 'na').length}/
              {groupedItems[section].length}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Itens da seção atual */}
      <div className="space-y-4">
        {currentSectionItems.map((item) => {
          const itemText = item.description.includes(': ') 
            ? item.description.split(': ')[1] 
            : item.description;

          return (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{itemText}</span>
                        {item.required && (
                          <Badge variant="destructive" className="text-xs">
                            Obrigatório
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className={cn(
                      "px-3 py-1 text-xs font-medium rounded-full",
                      getStatusColor(item.status)
                    )}>
                      {getStatusText(item.status)}
                    </div>
                  </div>

                  {!readOnly && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={item.status === "ok" ? "default" : "outline"}
                        onClick={() => handleItemStatusChange(item.id, 'ok')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        OK
                      </Button>
                      <Button
                        size="sm"
                        variant={item.status === "issue" ? "destructive" : "outline"}
                        onClick={() => handleItemStatusChange(item.id, 'issue')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Problema
                      </Button>
                      <Button
                        size="sm"
                        variant={item.status === "na" ? "secondary" : "outline"}
                        onClick={() => handleItemStatusChange(item.id, 'na')}
                      >
                        N/A
                      </Button>
                    </div>
                  )}

                  {/* Upload de evidências */}
                  {!readOnly && (
                    <div className="space-y-2">
                      <Label className="text-sm">Evidências (Fotos)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileUpload(item.id, e.target.files)}
                          className="text-sm"
                        />
                        <Button size="sm" variant="outline">
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      {item.evidence && item.evidence.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {item.evidence.length} arquivo(s) anexado(s)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Observações gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Observações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Adicione observações gerais sobre a inspeção..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            disabled={readOnly}
          />
        </CardContent>
      </Card>

      {/* Ações */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-border/10">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="rounded-lg font-bold"
            >
              Seção Anterior
            </Button>
            <Button 
              variant="outline"
              onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
              disabled={currentSection === sections.length - 1}
              className="rounded-lg font-bold"
            >
              Próxima Seção
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onSave(completedItems, notes)} className="rounded-lg font-bold">
              <Save className="mr-2 h-4 w-4" />
              Salvar Rascunho
            </Button>
            <Button onClick={() => onSubmit(completedItems, notes)} className="rounded-lg font-bold bg-primary hover:bg-primary/90">
              <Send className="mr-2 h-4 w-4" />
              Finalizar Checklist
            </Button>
          </div>
        </div>
    </div>
  );
}
