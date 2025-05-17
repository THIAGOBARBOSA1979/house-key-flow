
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Check, Info } from "lucide-react";
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

// Schema for form validation
const formSchema = z.object({
  inspectionType: z.string({
    required_error: "Selecione o tipo de vistoria",
  }),
  date: z.date({
    required_error: "Selecione uma data",
  }),
  time: z.string({
    required_error: "Selecione um horário",
  }),
  technician: z.string({
    required_error: "Selecione um responsável técnico",
  }),
  checklist: z.string({
    required_error: "Selecione um checklist",
  }),
  notes: z.string().optional(),
  notifyClient: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

// Example data - in a real app, these would come from your database
const inspectionTypes = [
  { id: "keyDelivery", name: "Entrega de chaves" },
  { id: "technicalInspection", name: "Vistoria técnica" },
  { id: "postWork", name: "Pós-obra" }
];

const technicians = [
  { id: "1", name: "Carlos Andrade" },
  { id: "2", name: "Luiza Mendes" },
  { id: "3", name: "Roberto Santos" }
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export const ScheduleInspectionForm = ({ 
  onSuccess, 
  clientId,
  propertyInfo
}: { 
  onSuccess?: () => void,
  clientId?: string,
  propertyInfo?: {
    property: string;
    unit: string;
    client: string;
  }
}) => {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
      notifyClient: true
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);
    
    // Here you would send the data to your backend
    // For now we'll just simulate success

    toast({
      title: "Vistoria agendada com sucesso",
      description: `Agendada para ${format(data.date, "dd/MM/yyyy")} às ${data.time}`,
    });
    
    if (data.notifyClient) {
      toast({
        title: "Notificação enviada",
        description: "O cliente foi notificado por e-mail.",
      });
    }
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {propertyInfo && (
          <div className="p-4 bg-muted rounded-md mb-4">
            <h3 className="text-sm font-medium mb-2">Informações do imóvel</h3>
            <p className="text-sm">{propertyInfo.property} - Unidade {propertyInfo.unit}</p>
            <p className="text-sm text-muted-foreground">Cliente: {propertyInfo.client}</p>
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
                      <SelectValue placeholder="Selecione o tipo de vistoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                  <SelectContent>
                    {technicians.map(tech => (
                      <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
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
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
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
                  <SelectContent>
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
                  placeholder="Informações adicionais sobre a vistoria"
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Instruções especiais, pontos de atenção ou informações relevantes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notifyClient"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Notificar cliente</FormLabel>
                <FormDescription>
                  Enviar e-mail de notificação para o cliente
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline">Cancelar</Button>
          <Button type="submit">Agendar Vistoria</Button>
        </div>
      </form>
    </Form>
  );
};
