
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isValid } from "date-fns";
import { safeFormat } from "@/lib/utils";
import { CalendarIcon, Check, Info, AlertTriangle, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { ChecklistSelector } from "./ChecklistSelector";
import { inspectionService, inspectionSchema } from "@/services";


type FormValues = z.infer<typeof inspectionSchema>;

// Example data - in a real app, these would come from your database
const inspectionTypes = [
  { id: "keyDelivery", name: "Entrega de chaves" },
  { id: "technicalInspection", name: "Vistoria técnica" },
  { id: "postWork", name: "Pós-obra" }
];

const technicians = inspectionService.getTechniciansSync();

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];


export const ScheduleInspectionForm = ({ 
  onSuccess, 
  clientId,
  propertyInfo,
  requestId
}: { 
  onSuccess?: () => void,
  clientId?: string,
  propertyInfo?: {
    property: string;
    unit: string;
    client: string;
  },
  requestId?: string
}) => {
  const { toast } = useToast();
  const [conflictWarning, setConflictWarning] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      inspectionType: "",
      date: new Date(),
      time: "",
      technician: "",
      checklist: "",
      notes: "",
      notifyClient: true,
      requestId: requestId || ""
    },
  });

  const watchDate = form.watch("date");
  const watchTechnician = form.watch("technician");

  React.useEffect(() => {
    const checkConflicts = async () => {
      if (watchDate && watchTechnician) {
        const conflicts = await inspectionService.getConflicts(watchDate, watchTechnician);
        if (conflicts.length > 0) {
          const slots = conflicts.map(c => c.time).join(", ");
          setConflictWarning(`Atenção: O técnico já possui ${conflicts.length} agendamento(s) nesta data nos horários: ${slots}.`);
        } else {
          setConflictWarning(null);
        }
      }
    };
    checkConflicts();
  }, [watchDate, watchTechnician]);


  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const newInspection = await inspectionService.schedule(data as any, propertyInfo);

    toast({
      title: "Agendamento Estratégico Confirmado",
      description: `O protocolo foi definido para ${safeFormat(data.date, "dd/MM/yyyy")} às ${data.time}`,

    });
    
    if (data.notifyClient && propertyInfo) {
      const { notificationService } = await import("@/services");
      await notificationService.createNotification(
        clientId || "client-1",
        "inspection_scheduled",
        newInspection.company_id || "",
        {
          relatedEntityId: newInspection.id,
          relatedEntityType: 'inspection',
          actionUrl: '/client/inspections'
        },
        {
          title: "Confirmação de Vistoria",
          message: `Sua jornada de entrega no empreendimento ${propertyInfo.property} avançou. A vistoria técnica foi agendada para ${safeFormat(data.date, "dd/MM/yyyy")} às ${data.time}.`

        }
      );


      toast({
        title: "Engajamento do Cliente Ativado",
        description: "O proprietário recebeu a confirmação via portal e e-mail institucional.",

      });
    }
    
    if (onSuccess) {
      onSuccess();
    }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {propertyInfo && (
          <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 mb-8 flex items-center gap-5 animate-in fade-in slide-in-from-top-2 duration-500 shadow-none hover:bg-primary/10 transition-all">
            <div className="p-4 bg-primary/20 rounded-2xl text-primary shadow-sem-md">
              <Building className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-1">Imóvel Selecionado</h3>
              <p className="text-sem-h3 font-black text-foreground tracking-tighter leading-tight">{propertyInfo.property} • Un. {propertyInfo.unit}</p>
              <p className="text-[11px] text-muted-foreground/60 font-black uppercase tracking-widest mt-0.5">Responsável: {propertyInfo.client}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="inspectionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Vistoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="shadow-sem-xl border-none">
                    {inspectionTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="technician"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável Técnico</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="shadow-sem-xl border-none">
                    {technicians.map(tech => (
                      <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {conflictWarning && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-amber-50 rounded-xl text-amber-700 text-[10px] font-bold border border-amber-200 animate-in fade-in slide-in-from-top-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {conflictWarning}
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Vistoria</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-bold",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          safeFormat(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-sem-xl border-none" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="shadow-sem-xl border-none">
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="checklist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Checklist de Verificação</FormLabel>
              <ChecklistSelector onSelect={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações Gerais</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Instruções especiais, pontos de atenção ou informações relevantes para o técnico..."
                  className="min-h-[100px] resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-[10px] uppercase font-bold tracking-tight text-muted-foreground">
                Dados visíveis apenas para a equipe interna
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notifyClient"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-4 space-y-0 rounded-3xl border-none bg-muted/30 p-6 group hover:bg-muted/50 transition-all cursor-pointer">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-5 w-5 rounded-lg border-primary/20 text-primary focus:ring-primary/20 transition-all"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-bold cursor-pointer normal-case tracking-normal mb-0">Notificar cliente automaticamente</FormLabel>
                <FormDescription className="text-xs">
                  Enviar e-mail e notificação push para o portal do cliente
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex gap-4 justify-end pt-10 border-t border-border/10 -mx-10 px-10 mt-10">
          <Button type="button" variant="outline" className="px-8 h-12 rounded-xl font-bold border-2 hover:bg-muted/50 transition-all" disabled={isSubmitting}>Descartar</Button>
          <Button type="submit" className="font-black uppercase tracking-widest text-[11px] px-12 h-12 rounded-xl shadow-sem-lg active:scale-95 transition-all" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Agendando...
              </div>
            ) : "Confirmar Agendamento"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
