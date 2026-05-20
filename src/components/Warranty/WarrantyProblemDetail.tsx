
import { useState } from "react";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  CalendarClock, 
  Upload, 
  Plus, 
  X 
} from "lucide-react";
import { PriorityLevel, ProblemStatus, WarrantyProblem, WarrantyAction } from "@/types";
import { cn } from "@/lib/utils";

const priorityConfig = {
  low: { icon: Clock, colorClass: "text-slate-500 bg-slate-100" },
  medium: { icon: Clock, colorClass: "text-blue-500 bg-blue-100" },
  high: { icon: AlertTriangle, colorClass: "text-amber-500 bg-amber-100" },
  critical: { icon: AlertTriangle, colorClass: "text-red-500 bg-red-100" },
};

const statusConfig = {
  open: { label: "Aberto", colorClass: "text-slate-500 border-slate-200 bg-slate-100" },
  in_progress: { label: "Em andamento", colorClass: "text-blue-500 border-blue-200 bg-blue-100" },
  pending: { label: "Pendente", colorClass: "text-amber-500 border-amber-200 bg-amber-100" },
  resolved: { label: "Resolvido", colorClass: "text-green-500 border-green-200 bg-green-100" },
  canceled: { label: "Cancelado", colorClass: "text-red-500 border-red-200 bg-red-100" },
};

// Mock data for technicians
const technicians = [
  { id: "1", name: "João Silva" },
  { id: "2", name: "Maria Oliveira" },
  { id: "3", name: "Carlos Santos" },
  { id: "4", name: "Ana Pereira" },
];

interface WarrantyProblemDetailProps {
  problem: WarrantyProblem;
  onUpdateProblem: (updatedProblem: WarrantyProblem) => void;
}

export const WarrantyProblemDetail = ({ problem, onUpdateProblem }: WarrantyProblemDetailProps) => {
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [actions, setActions] = useState<WarrantyAction[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const PriorityIcon = priorityConfig[problem.priority].icon;

  const handleStatusChange = (newStatus: ProblemStatus) => {
    onUpdateProblem({
      ...problem,
      status: newStatus,
      updatedAt: new Date(),
    });
    
    toast({
      title: "Status atualizado",
      description: `O status do problema foi atualizado para ${statusConfig[newStatus].label}`,
    });
  };

  const handleAssigneeChange = (technicianId: string) => {
    onUpdateProblem({
      ...problem,
      assignedTo: technicianId,
      updatedAt: new Date(),
    });
    
    toast({
      title: "Responsável atualizado",
      description: "O responsável pelo problema foi atualizado com sucesso.",
    });
  };

  const handlePriorityChange = (priority: PriorityLevel) => {
    onUpdateProblem({
      ...problem,
      priority,
      updatedAt: new Date(),
    });
    
    toast({
      title: "Prioridade atualizada",
      description: `A prioridade do problema foi atualizada para ${priority}`,
    });
  };

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
    const timeSpent = parseInt((form.elements.namedItem("timeSpent") as HTMLInputElement).value, 10);
    const materialsUsed = (form.elements.namedItem("materialsUsed") as HTMLTextAreaElement).value;
    
    const newAction: WarrantyAction = {
      id: `action-${Date.now()}`,
      problemId: problem.id,
      description,
      performedBy: "1", // Would come from auth context in real app
      timeSpent,
      materialsUsed: materialsUsed.split(',').map(item => item.trim()).filter(Boolean),
      createdAt: new Date(),
      images: [],
    };
    
    setActions([...actions, newAction]);
    setIsAddingAction(false);
    form.reset();
    
    toast({
      title: "Ação registrada",
      description: "A ação foi registrada com sucesso.",
    });
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="shadow-sm border">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{problem.title}</CardTitle>
            <CardDescription>
              Criado em {isValid(new Date(problem.createdAt)) ? format(new Date(problem.createdAt), "dd/MM/yyyy", { locale: ptBR }) : "—"} • Categoria: {problem.category}
            </CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full font-medium text-sm flex items-center gap-1.5 ${priorityConfig[problem.priority].colorClass}`}>
            <PriorityIcon className="h-4 w-4" />
            <span className="capitalize">{problem.priority}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Status</Label>
            <Select 
              defaultValue={problem.status} 
              onValueChange={(value) => handleStatusChange(value as ProblemStatus)}
            >
              <SelectTrigger className={`w-full ${statusConfig[problem.status].colorClass}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label>Responsável</Label>
            <Select 
              defaultValue={problem.assignedTo || ""} 
              onValueChange={handleAssigneeChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar responsável" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label>Prioridade</Label>
            <Select 
              defaultValue={problem.priority} 
              onValueChange={(value) => handlePriorityChange(value as PriorityLevel)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label>Descrição do problema</Label>
          <p className="mt-1 text-sm">{problem.description}</p>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium">Ações realizadas</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddingAction(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova ação
            </Button>
          </div>
          
          {actions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Nenhuma ação registrada para este problema.
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((action) => (
                <div 
                  key={action.id}
                  className="p-3 border rounded-md"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {technicians.find(t => t.id === action.performedBy)?.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {isValid(new Date(action.createdAt)) ? format(new Date(action.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{action.description}</p>
                  
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{action.timeSpent} minutos</span>
                    </div>
                    {action.materialsUsed.length > 0 && (
                      <div>
                        <span>Materiais: {action.materialsUsed.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          variant="outline"
          onClick={() => handleStatusChange("canceled")}
          disabled={problem.status === "resolved" || problem.status === "canceled"}
        >
          Cancelar problema
        </Button>
        <Button 
          variant="default"
          onClick={() => handleStatusChange("resolved")}
          disabled={problem.status === "resolved"}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Marcar como resolvido
        </Button>
      </CardFooter>

      {/* Dialog for adding new action */}
      <Dialog open={isAddingAction} onOpenChange={setIsAddingAction}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Registrar ação</DialogTitle>
            <DialogDescription>
              Registre as ações realizadas no atendimento deste problema.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição da ação</Label>
              <Textarea 
                id="description"
                name="description"
                placeholder="Descreva as ações realizadas..."
                className="min-h-24"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeSpent">Tempo gasto (minutos)</Label>
                <Input 
                  id="timeSpent"
                  name="timeSpent"
                  type="number"
                  min="1"
                  placeholder="45"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="materialsUsed">Materiais utilizados</Label>
                <Textarea 
                  id="materialsUsed"
                  name="materialsUsed"
                  placeholder="Separe por vírgulas..."
                  rows={1}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Evidências (Fotos/Documentos)</Label>
              <div className="border rounded-md p-3">
                <div className="space-y-2">
                  {files.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                          <div className="text-sm truncate max-w-xs">
                            {file.name}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-center relative">
                    <Input
                      type="file"
                      id="files"
                      className="opacity-0 absolute inset-0 z-10 cursor-pointer"
                      multiple
                      onChange={handleFilesChange}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      type="button"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar Arquivos
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: JPG, PNG, PDF, DOC (máximo 5MB por arquivo)
              </p>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddingAction(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Registrar ação
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
