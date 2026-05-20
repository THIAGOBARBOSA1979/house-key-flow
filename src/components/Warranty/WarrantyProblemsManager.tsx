
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, ListTodo, Settings2 } from "lucide-react";
import { WarrantyProblem, PriorityLevel } from "@/types";
import { WarrantyProblemDetail } from "./WarrantyProblemDetail";
import { v4 as uuidv4 } from "uuid";

// Available categories
const problemCategories = [
  "Hidráulica",
  "Elétrica",
  "Estrutural", 
  "Vedação e Impermeabilização",
  "Acabamento",
  "Esquadrias",
  "Equipamentos",
  "Outros"
];

interface WarrantyProblemsManagerProps {
  warrantyId: string;
  warrantyTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WarrantyProblemsManager = ({ 
  warrantyId, 
  warrantyTitle, 
  open, 
  onOpenChange 
}: WarrantyProblemsManagerProps) => {
  const { toast } = useToast();
  const [problems, setProblems] = useState<WarrantyProblem[]>([]);
  const [isAddingProblem, setIsAddingProblem] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  
  const selectedProblem = problems.find(p => p.id === selectedProblemId);
  const allProblemsResolved = problems.length > 0 && problems.every(p => p.status === "resolved");
  
  const handleAddProblem = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
    const category = (form.elements.namedItem("category") as HTMLSelectElement).value;
    const priority = (form.elements.namedItem("priority") as HTMLSelectElement).value as PriorityLevel;
    
    const newProblem: WarrantyProblem = {
      id: uuidv4(),
      title,
      description,
      category,
      priority,
      status: "open",
      assignedTo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setProblems([...problems, newProblem]);
    setIsAddingProblem(false);
    form.reset();
    
    toast({
      title: "Problema adicionado",
      description: "O problema foi adicionado com sucesso à solicitação de garantia.",
    });
  };
  
  const handleUpdateProblem = (updatedProblem: WarrantyProblem) => {
    setProblems(problems.map(p => 
      p.id === updatedProblem.id ? updatedProblem : p
    ));
    
    toast({
      title: "Problema atualizado",
      description: `O status do problema "${updatedProblem.title}" foi atualizado para ${
        updatedProblem.status === "resolved" ? "resolvido" :
        updatedProblem.status === "in_progress" ? "em andamento" :
        updatedProblem.status === "pending" ? "pendente" :
        updatedProblem.status === "canceled" ? "cancelado" : "aberto"
      }.`,
    });
  };
  
  const handleFinishWarranty = () => {
    // In a real application, this would submit to an API
    toast({
      title: "Garantia concluída",
      description: "Todos os problemas da garantia foram resolvidos. Garantia encerrada com sucesso.",
    });
    onOpenChange(false);
  };
  
  const getProblemStatusCount = () => {
    const counts = {
      open: 0,
      in_progress: 0,
      pending: 0,
      resolved: 0,
      canceled: 0,
    };
    
    problems.forEach(problem => {
      counts[problem.status]++;
    });
    
    return counts;
  };
  
  const statusCounts = getProblemStatusCount();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Gestão de Problemas - {warrantyTitle}
          </DialogTitle>
          <DialogDescription>
            Gerencie os problemas individuais desta solicitação de garantia.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Badge variant="outline">Total: {problems.length}</Badge>
            {statusCounts.open > 0 && (
              <Badge variant="outline" className="border-slate-200 bg-slate-100">
                Abertos: {statusCounts.open}
              </Badge>
            )}
            {statusCounts.in_progress > 0 && (
              <Badge variant="outline" className="border-blue-200 bg-blue-100">
                Em andamento: {statusCounts.in_progress}
              </Badge>
            )}
            {statusCounts.pending > 0 && (
              <Badge variant="outline" className="border-amber-200 bg-amber-100">
                Pendentes: {statusCounts.pending}
              </Badge>
            )}
            {statusCounts.resolved > 0 && (
              <Badge variant="outline" className="border-green-200 bg-green-100">
                Resolvidos: {statusCounts.resolved}
              </Badge>
            )}
          </div>
          
          <Button onClick={() => setIsAddingProblem(true)}>
            <PlusCircle className="h-4 w-4 mr-1" />
            Adicionar problema
          </Button>
        </div>

        {problems.length === 0 ? (
          <div className="text-center p-12 border rounded-md bg-slate-50">
            <Settings2 className="h-12 w-12 mx-auto text-slate-400" />
            <h3 className="mt-4 text-lg font-medium">Nenhum problema cadastrado</h3>
            <p className="mt-2 text-muted-foreground">
              Esta solicitação de garantia ainda não possui problemas específicos registrados.
            </p>
            <Button 
              onClick={() => setIsAddingProblem(true)} 
              className="mt-4"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Adicionar o primeiro problema
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-4">
              <div className="font-medium">Lista de problemas</div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {problems.map((problem) => (
                  <div
                    key={problem.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedProblemId === problem.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedProblemId(problem.id)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{problem.title}</h3>
                      <Badge 
                        variant="outline" 
                        className={
                          problem.status === "open" ? "border-slate-200 bg-slate-100" :
                          problem.status === "in_progress" ? "border-blue-200 bg-blue-100" :
                          problem.status === "pending" ? "border-amber-200 bg-amber-100" :
                          problem.status === "resolved" ? "border-green-200 bg-green-100" :
                          "border-red-200 bg-red-100"
                        }
                      >
                        {
                          problem.status === "open" ? "Aberto" :
                          problem.status === "in_progress" ? "Em andamento" :
                          problem.status === "pending" ? "Pendente" :
                          problem.status === "resolved" ? "Resolvido" :
                          "Cancelado"
                        }
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{problem.category}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {selectedProblem ? (
                <WarrantyProblemDetail 
                  problem={selectedProblem} 
                  onUpdateProblem={handleUpdateProblem} 
                />
              ) : (
                <div className="text-center p-12 border rounded-md bg-slate-50 h-full flex flex-col items-center justify-center">
                  <p className="text-muted-foreground">
                    Selecione um problema na lista para visualizar os detalhes
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <DialogFooter className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
            
            {problems.length > 0 && (
              <Button
                type="button"
                disabled={!allProblemsResolved}
                onClick={handleFinishWarranty}
              >
                Finalizar garantia
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
      
      {/* Dialog for adding new problem */}
      <Dialog open={isAddingProblem} onOpenChange={setIsAddingProblem}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar novo problema</DialogTitle>
            <DialogDescription>
              Cadastre um novo problema específico para esta solicitação de garantia.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddProblem} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do problema</Label>
              <Input 
                id="title"
                name="title"
                placeholder="Informe um título para o problema"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select name="category" required defaultValue={problemCategories[0]}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {problemCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select name="priority" required defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
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
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição do problema</Label>
              <Textarea 
                id="description"
                name="description"
                placeholder="Descreva detalhadamente o problema..."
                rows={4}
                required
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddingProblem(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Adicionar problema
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
