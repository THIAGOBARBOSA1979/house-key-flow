import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { nonConformityService } from "@/services/operations/NonConformityService";
import { notificationService } from "@/services/core/NotificationService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks";
import { Loader2, AlertTriangle } from "lucide-react";

const nonConformitySchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(10, "Descrição deve ser detalhada"),
  origin: z.enum(['inspection', 'warranty', 'audit', 'customer_complaint']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  identified_at: z.string().optional()
});

type NonConformityFormValues = z.infer<typeof nonConformitySchema>;

interface NonConformityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const NonConformityForm = ({ open, onOpenChange, onSuccess }: NonConformityFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NonConformityFormValues>({
    resolver: zodResolver(nonConformitySchema),
    defaultValues: {
      title: "",
      description: "",
      origin: "inspection",
      severity: "medium",
      identified_at: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = async (values: NonConformityFormValues) => {
    if (!user?.company_id) return;
    
    setIsSubmitting(true);
    try {
      await nonConformityService.create({
        ...values,
        company_id: user.company_id,
        status: 'open',
        identified_at: values.identified_at ? new Date(values.identified_at) : new Date(),
        created_at: new Date(),
        updated_at: new Date()
      } as any);

      // Trigger Notification for relevant users
      await notificationService.createNotification(
        user.id,
        'SYSTEM_UPDATE',
        { company_id: user.company_id },
        { 
          title: "Nova Não Conformidade", 
          message: `O evento "${values.title}" foi registrado no sistema.` 
        }
      );

      toast({
        title: "Sucesso",
        description: "Não conformidade registrada com sucesso.",
      });
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível registrar a não conformidade.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] rounded-card border-none shadow-sem-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
            <AlertTriangle className="text-orange-500" />
            Nova Não Conformidade
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
            Registro técnico para conformidade ISO 9001.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">Título do Evento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Infiltração na laje L02" className="rounded-xl h-12 font-bold" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">Origem</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl h-12 font-bold">
                          <SelectValue placeholder="Selecione a origem" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="inspection">Vistoria</SelectItem>
                        <SelectItem value="warranty">Garantia</SelectItem>
                        <SelectItem value="audit">Auditoria</SelectItem>
                        <SelectItem value="customer_complaint">Reclamação Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">Severidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl h-12 font-bold">
                          <SelectValue placeholder="Selecione a severidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="identified_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">Data da Ocorrência</FormLabel>
                  <FormControl>
                    <Input type="date" className="rounded-xl h-12 font-bold" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest">Descrição Detalhada</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva detalhadamente o evento e as evidências encontradas..." 
                      className="rounded-xl min-h-[120px] font-medium resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-3 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                className="rounded-xl h-12 font-bold"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="rounded-xl h-12 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Registrar Ocorrência
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};