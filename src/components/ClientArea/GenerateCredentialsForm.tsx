
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Key, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// Form schema with validation
const formSchema = z.object({
  email: z.string().email({
    message: "Digite um email válido"
  }),
  sendEmail: z.boolean().default(true),
  generatePassword: z.boolean().default(true),
  password: z.string().optional(),
  clientId: z.string({
    required_error: "Selecione um cliente"
  })
});

type FormValues = z.infer<typeof formSchema>;

// Mock client data - will be replaced with real data from API
const mockClients = [
  { id: "1", name: "Maria Oliveira", email: "maria.oliveira@email.com" },
  { id: "2", name: "João Silva", email: "joao.silva@email.com" },
  { id: "3", name: "Ana Santos", email: "ana.santos@email.com" },
];

interface GenerateCredentialsFormProps {
  onSubmit?: (data: FormValues) => void;
  onCancel?: () => void;
}

export function GenerateCredentialsForm({ onSubmit, onCancel }: GenerateCredentialsFormProps) {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  
  // Initialize form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      email: "",
      sendEmail: true,
      generatePassword: true,
      password: "",
    },
  });
  
  // Watch form values for conditional rendering
  const generatePassword = form.watch("generatePassword");
  
  // Update email when client changes
  const handleClientChange = (clientId: string) => {
    const client = mockClients.find(c => c.id === clientId);
    if (client) {
      form.setValue("email", client.email);
    }
    setSelectedClient(clientId);
  };
  
  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    if (onSubmit) {
      onSubmit(values);
    } else {
      // Default behavior if no onSubmit is provided
      toast({
        title: "Credenciais geradas",
        description: "As credenciais de acesso foram geradas e enviadas ao cliente.",
      });
      console.log("Form submitted:", values);
      form.reset();
      setSelectedClient(null);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente <span className="text-destructive">*</span></FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleClientChange(value);
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {selectedClient && (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="cliente@email.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sendEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enviar credenciais por email
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        As credenciais serão enviadas automaticamente para o email do cliente
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="generatePassword"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Gerar senha automática
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        O sistema irá gerar uma senha aleatória segura
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {!generatePassword && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha manual <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Digite uma senha" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </>
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={!selectedClient}>
            Gerar Credenciais
          </Button>
        </div>
      </form>
    </Form>
  );
}
