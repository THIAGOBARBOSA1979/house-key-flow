
import React, { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X, Upload, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";

interface WarrantyServiceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warrantyId: string;
  warrantyTitle: string;
}

interface ServiceFormValues {
  technician: string;
  date: Date | undefined;
  time: string;
  description: string;
  materials: string;
  status: string;
  finalObservation?: string;
}

// Mock data for technicians
const technicians = [
  { id: "1", name: "João Silva" },
  { id: "2", name: "Maria Oliveira" },
  { id: "3", name: "Carlos Santos" },
  { id: "4", name: "Ana Pereira" },
];

const WarrantyService: React.FC<WarrantyServiceProps> = ({
  open,
  onOpenChange,
  warrantyId,
  warrantyTitle,
}) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // React Hook Form setup
  const form = useForm<ServiceFormValues>({
    defaultValues: {
      technician: "",
      date: new Date(),
      time: "09:00",
      description: "",
      materials: "",
      status: "in_progress",
      finalObservation: "",
    },
  });

  const status = form.watch("status");

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ServiceFormValues) => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Form data:", data);
      console.log("Files:", files);

      // Mock webhook trigger
      const webhookEvent = data.status === "completed" ? "garantia_concluida" : "garantia_em_atendimento";
      console.log(`Triggering webhook: ${webhookEvent}`);

      toast({
        title: data.status === "completed" ? "Garantia concluída" : "Garantia em atendimento",
        description: data.status === "completed" 
          ? "O atendimento da garantia foi concluído com sucesso."
          : "O atendimento da garantia foi iniciado.",
      });

      setIsSubmitting(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Atender Solicitação de Garantia</DialogTitle>
          <DialogDescription>
            {warrantyTitle} (#{warrantyId})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="technician"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Técnico Responsável</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um técnico" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data do Atendimento</FormLabel>
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
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
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
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          className="pl-8"
                        />
                      </FormControl>
                      <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Atendimento</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva as ações realizadas durante o atendimento..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="materials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materiais Utilizados</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Liste os materiais utilizados (opcional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Evidências (Fotos/Documentos)</FormLabel>
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

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status do Atendimento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="pending">Pendente de Peças/Materiais</SelectItem>
                      <SelectItem value="rescheduled">Reagendado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {status === "completed" && (
              <FormField
                control={form.control}
                name="finalObservation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Finais</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva as observações finais do atendimento..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                {status === "completed"
                  ? "Finalizar Atendimento"
                  : "Registrar Atendimento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WarrantyService;
