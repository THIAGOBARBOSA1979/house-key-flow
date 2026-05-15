
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Building, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres"
  }),
  email: z.string().email({
    message: "Digite um email válido"
  }),
  phone: z.string().min(10, {
    message: "Digite um telefone válido"
  }),
  document: z.string().min(11, {
    message: "Digite um CPF/CNPJ válido"
  }),
  property: z.string({
    required_error: "Selecione um empreendimento"
  }),
  unit: z.string({
    required_error: "Informe a unidade"
  }),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Mock property data - will be replaced with real data from API
const mockProperties = [
  { id: "1", name: "Edifício Aurora" },
  { id: "2", name: "Residencial Verde Vida" },
  { id: "3", name: "Condomínio Monte Alto" },
];

interface NewClientFormProps {
  onSubmit?: (data: FormValues) => void;
  onCancel?: () => void;
}

export function NewClientForm({ onSubmit, onCancel }: NewClientFormProps) {
  // Initialize form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      document: "",
      property: "",
      unit: "",
      address: "",
    },
  });
  
  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    if (onSubmit) {
      onSubmit(values);
    } else {
      // Default behavior if no onSubmit is provided
      toast({
        title: "Cliente cadastrado",
        description: "O cliente foi cadastrado com sucesso.",
      });
      console.log("Form submitted:", values);
      form.reset();
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Maria Oliveira" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid gap-6 md:grid-cols-2">
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF/CNPJ <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="000.000.000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="property"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empreendimento <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="shadow-sem-xl border-none">
                      {mockProperties.map(property => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Apto 101 Bloco A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço complementar</FormLabel>
                <FormControl>
                  <Input placeholder="Endereço completo (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-6 border-t border-border/10 -mx-6 px-6 bg-muted/5">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="px-6">
              Cancelar
            </Button>
          )}
          <Button type="submit" className="px-8 font-black uppercase tracking-widest text-[10px]">
            Cadastrar Cliente
          </Button>
        </div>
      </form>
    </Form>
  );
}
