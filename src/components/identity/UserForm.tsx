import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { propertyService } from "@/services";
import { UserFormData, User } from "@/types/user";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const userFormSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  role: z.string(),
  status: z.string(),
  propertyId: z.string().optional(),
  propertyName: z.string().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

interface UserFormProps {
  onSave: (userData: UserFormData) => void;
  onCancel?: () => void;
  editingUser?: User | null;
}

export const UserForm = ({ onSave, onCancel, editingUser }: UserFormProps) => {
  const properties = propertyService.getAll();
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "client",
      status: "active",
      propertyId: "",
      propertyName: "",
      unit: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (editingUser) {
      form.reset({
        name: editingUser.name || "",
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        role: editingUser.role || "client",
        status: editingUser.status || "active",
        propertyId: editingUser.propertyId || "",
        propertyName: editingUser.propertyName || "",
        unit: editingUser.unit || "",
        notes: editingUser.notes || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        role: "client",
        status: "active",
        propertyId: "",
        propertyName: "",
        unit: "",
        notes: "",
      });
    }
  }, [editingUser, form]);

  const onSubmit = (data: UserFormData) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ex: João Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email institucional <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone / WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nível de Acesso</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o acesso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gerente de Obras</SelectItem>
                    <SelectItem value="technical">Técnico de Vistoria</SelectItem>
                    <SelectItem value="client">Cliente / Proprietário</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {form.watch("role") === "client" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-dashed pt-6">
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vincular Empreendimento</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      const prop = properties.find(p => p.id === value);
                      if (prop) form.setValue("propertyName", prop.name);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties.map(prop => (
                        <SelectItem key={prop.id} value={prop.id!}>{prop.name}</SelectItem>
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
                  <FormLabel>Unidade / Apartamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 102 Bloco B" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações Administrativas</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Notas internas sobre o usuário..." 
                  className="min-h-[100px] resize-none" 
                  rows={3} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-border/10 -mx-8 px-8 bg-muted/5">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="px-10 font-black uppercase tracking-widest text-xs">
            {editingUser ? "Salvar Alterações" : "Criar Usuário"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
