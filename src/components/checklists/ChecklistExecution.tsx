
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChecklistItem, ChecklistGroup } from "@/services";
import { Check, X, AlertCircle, Camera, Save, Send, PenTool, User, ShieldCheck, MapPin, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks";
import { motion, AnimatePresence } from "framer-motion";


interface ChecklistExecutionProps {
  title: string;
  groups: ChecklistGroup[];
  onSave: (completedGroups: ChecklistGroup[], notes: string) => void;
  onSubmit: (completedGroups: ChecklistGroup[], notes: string) => void;
  readOnly?: boolean;
}

export function ChecklistExecution({ 
  title, 
  groups, 
  onSave, 
  onSubmit, 
  readOnly = false 
}: ChecklistExecutionProps) {
  const { toast } = useToast();
  const [completedGroups, setCompletedGroups] = useState<ChecklistGroup[]>(groups);
  const [notes, setNotes] = useState("");
  const [currentSection, setCurrentSection] = useState(0);
  
  // Stats
  const allItems = completedGroups.flatMap(g => g.items);
  const totalItems = allItems.length;
  const completedCount = allItems.filter(item => item.status && item.status !== 'na').length;
  const progressPercentage = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  const handleItemStatusChange = (groupId: string, itemId: string, status: 'ok' | 'issue' | 'na') => {
    setCompletedGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { 
              ...group, 
              items: group.items.map(item => 
                item.id === itemId ? { ...item, status } : item
              ) 
            }
          : group
      )
    );

    // Auto-alert for critical non-conformity
    const item = allItems.find(i => i.id === itemId);
    if (status === 'issue' && item?.severity === 'critical') {
      toast({
        title: "ALERTA CRÍTICO",
        description: `Não conformidade crítica detectada: ${item.description}`,
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (groupId: string, itemId: string, files: FileList | null) => {
    if (!files) return;
    
    setCompletedGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { 
              ...group, 
              items: group.items.map(item => 
                item.id === itemId 
                  ? { 
                      ...item, 
                      evidence: [
                        ...(item.evidence || []),
                        ...Array.from(files).map(f => ({ 
                          id: `ev-${crypto.randomUUID()}`, 
                          file: f, 
                          url: URL.createObjectURL(f), 
                          timestamp: new Date() 
                        }))
                      ] 
                    }
                  : item
              ) 
            }
          : group
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

  const currentSectionGroup = completedGroups[currentSection] || { items: [] };
  const currentSectionItems = currentSectionGroup.items;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-right-2 duration-slow">
      {/* Header com progresso sticky para mobile */}
      <Card className="sticky top-0 z-20 shadow-sem-lg border-primary/10 backdrop-blur-md bg-card/90 sm:rounded-3xl">
        <CardHeader className="py-6">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <CardTitle className="text-xl md:text-2xl truncate font-black tracking-tight">{title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1 font-black uppercase tracking-widest">
                {completedCount} / {totalItems} ITENS VERIFICADOS
              </p>
            </div>
            <div className="flex flex-col items-end">
              <Badge variant={progressPercentage === 100 ? "default" : "outline"} className={cn(
                "font-black tracking-widest text-xs px-4 py-1 rounded-full uppercase",
                progressPercentage === 100 && "bg-status-complete shadow-sem-md"
              )}>
                {Math.round(progressPercentage)}% CONCLUÍDO
              </Badge>
            </div>
          </div>
          <div className="mt-6 relative h-2.5 bg-muted rounded-full overflow-hidden shadow-sem-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="absolute h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]"
            />
          </div>
        </CardHeader>
      </Card>


      {/* Navegação por seções otimizada */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x">
        {completedGroups.map((group, index) => (
          <Button
            key={group.id}
            variant={currentSection === index ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentSection(index)}
            className={cn(
              "whitespace-nowrap rounded-2xl font-black uppercase tracking-widest text-[10px] h-10 px-5 transition-all snap-start",
              currentSection === index ? "shadow-sem-md scale-105" : "opacity-60 hover:opacity-100"
            )}
          >
            {group.name}
            <Badge variant="secondary" className="ml-2 bg-white/20 text-[10px] rounded-md px-1.5">
              {group.items.filter(item => item.status && item.status !== 'na').length}/
              {group.items.length}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Itens da seção atual com animação */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={completedGroups[currentSection]?.id}
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

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800">{item.description}</span>
                        {item.required && (
                          <Badge variant="destructive" className="text-[10px] font-black uppercase py-0 px-2">
                            Obrigatório
                          </Badge>
                        )}
                        <Badge variant="outline" className={cn(
                          "text-[10px] font-black uppercase py-0 px-2",
                          item.severity === 'critical' ? 'border-red-500 text-red-500' :
                          item.severity === 'high' ? 'border-orange-500 text-orange-500' : 'border-blue-500 text-blue-500'
                        )}>
                          {item.severity}
                        </Badge>
                      </div>
                    </div>

                    <div className={cn(
                      "px-3 py-1 text-xs font-black uppercase rounded-lg shrink-0",
                      getStatusColor(item.status)
                    )}>
                      {getStatusText(item.status)}
                    </div>
                  </div>

                  {!readOnly && (
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        size="sm"
                        variant={item.status === "ok" ? "default" : "outline"}
                        onClick={() => handleItemStatusChange(completedGroups[currentSection].id, item.id, 'ok')}
                        className={cn("rounded-lg font-bold", item.status === 'ok' && "bg-status-complete")}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        CONFORME
                      </Button>
                      <Button
                        size="sm"
                        variant={item.status === "issue" ? "destructive" : "outline"}
                        onClick={() => handleItemStatusChange(completedGroups[currentSection].id, item.id, 'issue')}
                        className="rounded-lg font-bold"
                      >
                        <X className="h-4 w-4 mr-1" />
                        FALHA
                      </Button>
                      <Button
                        size="sm"
                        variant={item.status === "na" ? "secondary" : "outline"}
                        onClick={() => handleItemStatusChange(completedGroups[currentSection].id, item.id, 'na')}
                        className="rounded-lg font-bold"
                      >
                        N/A
                      </Button>
                    </div>
                  )}

                  {/* Evidências */}
                  <div className="space-y-3 bg-muted/30 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-black uppercase text-muted-foreground flex items-center gap-2">
                        <Camera size={14} /> Evidências Fotográficas
                      </Label>
                      {!readOnly && (
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileUpload(completedGroups[currentSection].id, item.id, e.target.files)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <Button size="sm" variant="outline" className="h-8 rounded-lg font-bold text-[10px] uppercase">
                            Adicionar Fotos
                          </Button>
                        </div>
                      )}
                    </div>

                    {item.evidence && item.evidence.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {item.evidence.map((ev, idx) => (
                          <div key={ev.id} className="relative group shrink-0">
                            <img 
                              src={ev.url} 
                              alt="Evidência" 
                              className="h-20 w-20 object-cover rounded-lg border-2 border-white shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                              <Info size={16} className="text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground italic">Nenhuma foto anexada a este item.</p>
                    )}
                  </div>
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
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-xl border-t border-border/50 z-30 flex gap-4 sm:px-12 md:px-24">
        <Button 
          variant="outline" 
          onClick={() => onSave(completedGroups, notes)} 
          className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-xs border-2 shadow-sem-sm hover:shadow-sem-md active:scale-95 transition-all"
        >
          <Save className="mr-2 h-4 w-4" />
          Rascunho
        </Button>
        <Button 
          onClick={() => {
            const pending = allItems.filter(i => i.required && !i.status);
            if (pending.length > 0) {
              toast({
                title: "Pendências Obrigatórias",
                description: `Existem ${pending.length} itens obrigatórios não verificados.`,
                variant: "destructive"
              });
              return;
            }
            onSubmit(completedGroups, notes);
          }} 
          className="flex-[2] rounded-2xl h-14 font-black bg-primary hover:bg-primary/90 shadow-sem-lg hover:shadow-primary/30 uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <div className="flex flex-col items-center leading-tight">
            <span className="text-[10px] opacity-70">Finalizar</span>
            <span className="text-sm">VISTORIA TÉCNICA</span>
          </div>
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

