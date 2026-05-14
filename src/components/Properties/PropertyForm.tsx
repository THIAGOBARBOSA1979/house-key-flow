import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { propertySchema, type Property } from "@/services/PropertyService";

interface PropertyFormProps {
  initialData?: Property;
  onSubmit: (data: Property) => void;
  onCancel?: () => void;
}

export function PropertyForm({ initialData, onSubmit, onCancel }: PropertyFormProps) {
  const form = useForm<Property>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData || {
      name: "",
      location: "",
      units: 1,
      completedUnits: 0,
      status: "pending",
      description: "",
    },
  });
  
  const handleSubmit = (values: Property) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do empreendimento <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Residencial Vista Verde" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localização <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ex: São Paulo, SP" {...field} />
                </FormControl>
                <FormDescription>Cidade e Estado</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="units"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total de Unidades <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="progress">Em andamento</SelectItem>
                      <SelectItem value="complete">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
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
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Breve descrição do empreendimento..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-6 border-t border-border/10">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg font-bold">
              Cancelar
            </Button>
          )}
          <Button type="submit" className="rounded-lg font-bold bg-primary hover:bg-primary/90">
            {initialData ? "Salvar Alterações" : "Criar Empreendimento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
