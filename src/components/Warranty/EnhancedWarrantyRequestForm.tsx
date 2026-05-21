
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from 'uuid';
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { WarrantyProblemItem, WarrantyProblem } from "@/components/Warranty/WarrantyProblemItem";

// Form schema with validation
const formSchema = z.object({
  title: z.string().min(5, {
    message: "O título deve ter pelo menos 5 caracteres"
  }).max(100, {
    message: "O título deve ter no máximo 100 caracteres"
  }),
  contactPreference: z.enum(["email", "phone", "any"]).optional(),
  additionalInfo: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

// Import the WarrantyItem type
import type { WarrantyItem } from "@/types/warranty";

interface EnhancedWarrantyRequestFormProps {
  onSubmit?: (data: FormValues & { problems: WarrantyProblem[] }) => void;
  onCancel?: () => void;
  selectedItem?: WarrantyItem | null;
}

export function EnhancedWarrantyRequestForm({ onSubmit, onCancel, selectedItem }: EnhancedWarrantyRequestFormProps) {
  const [problems, setProblems] = useState<WarrantyProblem[]>([
    {
      id: uuidv4(),
      category: "",
      location: "",
      description: "",
      severity: "moderate",
      photos: []
    }
  ]);
  
  // Initialize form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      contactPreference: "any",
      additionalInfo: ""
    },
  });
  
  // Handle problem change
  const handleProblemChange = (index: number, field: keyof WarrantyProblem, value: any) => {
    const updatedProblems = [...problems];
    updatedProblems[index] = {
      ...updatedProblems[index],
      [field]: value
    };
    setProblems(updatedProblems);
  };
  
  // Add a new problem
  const addProblem = () => {
    setProblems([
      ...problems,
      {
        id: uuidv4(),
        category: "",
        location: "",
        description: "",
        severity: "moderate",
        photos: []
      }
    ]);
  };
  
  // Remove a problem
  const removeProblem = (index: number) => {
    if (problems.length <= 1) {
      toast({
        title: "Atenção",
        description: "É necessário pelo menos um problema na solicitação",
        variant: "destructive"
      });
      return;
    }
    
    const updatedProblems = [...problems];
    updatedProblems.splice(index, 1);
    setProblems(updatedProblems);
  };
  
  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    // Validate problems
    const invalidProblems = problems.filter(
      problem => !problem.category || !problem.location || !problem.description
    );
    
    if (invalidProblems.length > 0) {
      toast({
        title: "Dados incompletos",
        description: `Por favor, preencha todos os campos obrigatórios dos problemas.`,
        variant: "destructive"
      });
      return;
    }
    
    // Combine form values with problems
    const completeData = {
      ...values,
      problems
    };
    
    if (onSubmit) {
      onSubmit(completeData);
    } else {
      // Default behavior if no onSubmit is provided
      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de garantia foi enviada com sucesso.",
      });
      console.log("Form submitted:", completeData);
      
      // Reset the form
      form.reset();
      setProblems([
        {
          id: uuidv4(),
          category: "",
          location: "",
          description: "",
          severity: "moderate",
          photos: []
        }
      ]);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-slow">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Título do Protocolo Técnico <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Descreva brevemente o motivo principal..." className="h-12 rounded-xl border-2 focus-visible:ring-primary/10" {...field} />
              </FormControl>
              <FormMessage className="font-bold text-[10px]" />
            </FormItem>
          )}
        />
        
        {/* Problems Section */}
        <div className="space-y-6 bg-muted/20 p-6 md:p-8 rounded-[2rem] border-2 border-dashed border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-black tracking-tight">Detalhamento dos Problemas</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Breakdown técnico conforme normas ABNT</p>
            </div>
          </div>
          
          {problems.length > 2 && (
            <Alert variant="default" className="bg-amber-50 text-amber-900 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                Você está reportando múltiplos problemas. Considere agrupar problemas similares ou do mesmo ambiente.
              </AlertDescription>
            </Alert>
          )}
          
          {problems.map((problem, index) => (
            <WarrantyProblemItem
              key={problem.id}
              index={index}
              problem={problem}
              onChange={handleProblemChange}
              onRemove={removeProblem}
            />
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addProblem}
            className="w-full h-14 rounded-2xl border-2 border-primary/20 hover:border-primary hover:bg-primary/5 text-primary font-black uppercase tracking-widest text-[11px] transition-all active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
            Adicionar Outra Ocorrência
          </Button>
        </div>
        
        {/* Additional Information Field */}
        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Informações adicionais</FormLabel>
              <FormControl>
                <textarea 
                  className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  placeholder="Forneça qualquer informação adicional que possa ajudar nossa equipe técnica"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="h-12 rounded-xl font-bold px-8">
              Cancelar
            </Button>
          )}
          <Button type="submit" className="h-12 rounded-xl px-12 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 active:scale-[0.98]">
            Transmitir Solicitação Técnica
          </Button>
        </div>
      </form>
    </Form>
  );
}
