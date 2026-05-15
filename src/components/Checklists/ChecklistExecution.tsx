
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChecklistItem } from "@/services/ChecklistService";
import { Check, X, AlertCircle, Camera, Save, Send, PenTool, User, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";


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
  const { toast } = useToast();
  const [completedItems, setCompletedItems] = useState<ChecklistItem[]>(items);
  const [notes, setNotes] = useState("");
  const [currentSection, setCurrentSection] = useState(0);
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState("");
  const [clientSignature, setClientSignature] = useState("");


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
  const completedCount = completedItems.filter(item => item.status && (item.status === 'ok' || item.status === 'issue')).length;
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
          ? { ...item, evidence: Array.from(files).map(f => ({ id: `ev-${Date.now()}`, file: f, url: URL.createObjectURL(f), timestamp: new Date() })) }
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
    <div className="space-y-6 pb-20">
      {/* Header com progresso sticky para mobile */}
      <Card className="sticky top-0 z-20 shadow-lg border-primary/10 backdrop-blur-md bg-card/90">
        <CardHeader className="py-4">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <CardTitle className="text-lg md:text-xl truncate">{title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1 font-bold">
                {completedCount} / {totalItems} ITENS VERIFICADOS
              </p>
            </div>
            <div className="flex flex-col items-end">
              <Badge variant={progressPercentage === 100 ? "default" : "outline"} className={cn(
                "font-black tracking-tighter text-sm px-3",
                progressPercentage === 100 && "bg-status-complete"
              )}>
                {Math.round(progressPercentage)}%
              </Badge>
            </div>
          </div>
          <div className="mt-4 relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="absolute h-full bg-primary"
            />
          </div>
        </CardHeader>
      </Card>


      {/* Navegação por seções otimizada */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x">
        {sections.map((section, index) => (
          <Button
            key={section}
            variant={currentSection === index ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentSection(index)}
            className={cn(
              "whitespace-nowrap rounded-xl font-bold transition-all snap-start",
              currentSection === index ? "shadow-md scale-105" : "opacity-70"
            )}
          >
            {section}
            <Badge variant="secondary" className="ml-2 bg-white/20 text-[10px]">
              {groupedItems[section].filter(item => item.status && item.status !== 'na').length}/
              {groupedItems[section].length}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Itens da seção atual com animação */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={sections[currentSection]}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {currentSectionItems.map((item) => {
              const itemText = item.description.includes(': ') 
                ? item.description.split(': ')[1] 
                : item.description;

              return (
                <Card key={item.id} className={cn(
                  "border-l-4 transition-all hover:shadow-md",
                  item.status === 'ok' ? "border-l-status-complete" : 
                  item.status === 'issue' ? "border-l-status-error" : 
                  item.status === 'na' ? "border-l-muted" : "border-l-status-pending"
                )}>
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
          </motion.div>

        </AnimatePresence>
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

      {/* Seção de Assinaturas (Modal/Sheet ou expandido) */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PenTool size={20} className="text-primary" />
            Formalização Técnica
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label className="font-bold flex items-center gap-2">
              <ShieldCheck size={16} /> Assinatura do Inspetor
            </Label>
            <div className="h-40 border-2 border-dashed border-primary/20 rounded-xl bg-white flex items-center justify-center cursor-crosshair hover:bg-muted/30 transition-colors">
              <p className="text-xs text-muted-foreground uppercase font-black opacity-20">Espaço para assinatura digital</p>
            </div>
            <Input 
              placeholder="Nome do Inspetor" 
              defaultValue="Administrador"
              className="rounded-lg font-bold"
            />
          </div>
          
          <div className="space-y-4">
            <Label className="font-bold flex items-center gap-2">
              <User size={16} /> Assinatura do Cliente / Responsável
            </Label>
            <div className="h-40 border-2 border-dashed border-primary/20 rounded-xl bg-white flex items-center justify-center cursor-crosshair hover:bg-muted/30 transition-colors">
              <p className="text-xs text-muted-foreground uppercase font-black opacity-20">Espaço para assinatura digital</p>
            </div>
            <Input 
              placeholder="Nome do Cliente / Responsável" 
              className="rounded-lg font-bold"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ações Fixas no Rodapé (Mobile optimized) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border/50 z-30 flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => onSave(completedItems, notes)} 
          className="flex-1 rounded-xl h-12 font-bold uppercase tracking-tighter"
        >
          <Save className="mr-2 h-4 w-4" />
          Pausar
        </Button>
        <Button 
          onClick={() => {
            const pending = completedItems.filter(i => i.required && !i.status);
            if (pending.length > 0) {
              toast({
                title: "Itens Obrigatórios",
                description: `Ainda restam ${pending.length} itens obrigatórios sem preenchimento.`,
                variant: "destructive"
              });
              return;
            }
            onSubmit(completedItems, notes);
          }} 
          className="flex-[2] rounded-xl h-12 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 uppercase tracking-tighter"
        >
          <Send className="mr-2 h-4 w-4" />
          Finalizar Vistoria
        </Button>
      </div>
    </div>
  );
}

