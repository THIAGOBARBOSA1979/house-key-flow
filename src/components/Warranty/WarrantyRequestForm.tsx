
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

// Categories for warranty claims
const warrantyCategories = [
  "Hidráulica (ABNT NBR 15575-6)",
  "Elétrica (ABNT NBR 5410)",
  "Estrutural (ABNT NBR 15575-2)", 
  "Impermeabilização (ABNT NBR 9575)",
  "Acabamento",
  "Esquadrias (ABNT NBR 10821)",
  "Revestimentos (ABNT NBR 13753/54/55)",
  "Outros"
];

// Priority options
const priorityOptions = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Crítica" }
];

// Form schema with validation
const formSchema = z.object({
  title: z.string().min(5, {
    message: "O título deve ter pelo menos 5 caracteres"
  }).max(100, {
    message: "O título deve ter no máximo 100 caracteres"
  }),
  category: z.string({
    required_error: "Selecione uma categoria"
  }),
  priority: z.string({
    required_error: "Selecione uma prioridade"
  }),
  description: z.string().min(20, {
    message: "A descrição deve ter pelo menos 20 caracteres"
  }).max(1000, {
    message: "A descrição deve ter no máximo 1000 caracteres"
  }),
  location: z.string().min(3, {
    message: "Informe o ambiente onde ocorre o problema"
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface WarrantyRequestFormProps {
  onSubmit?: (data: FormValues & { photos: string[] }) => void;
  onCancel?: () => void;
}

export function WarrantyRequestForm({ onSubmit, onCancel }: WarrantyRequestFormProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Initialize form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      priority: "medium",
      description: "",
      location: "",
    },
  });
  
  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    // Combine form values with photos
    const completeData = {
      ...values,
      photos
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
    }
  };
  
  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Convert file to data URL for preview
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPhotos([...photos, reader.result]);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };
  
  // Remove a photo
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Infiltração no banheiro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warrantyCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ambiente <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Banheiro da suíte, Cozinha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição detalhada <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva o problema com o máximo de detalhes: quando foi percebido, local exato, sintomas, etc."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Photo upload section */}
        <div className="space-y-3">
          <div>
            <FormLabel>Anexar fotos</FormLabel>
            <p className="text-sm text-muted-foreground">
              Adicione fotos que mostrem claramente o problema para facilitar a análise
            </p>
          </div>
          
          {/* Photo grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                <img 
                  src={photo} 
                  alt={`Foto ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-background/80 text-foreground p-1 rounded-full hover:bg-background"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            
            {/* Upload button */}
            <label className="aspect-square rounded-md border border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="sr-only"
              />
              <Camera className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground text-center">Adicionar foto</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit">
            Enviar solicitação
          </Button>
        </div>
      </form>
    </Form>
  );
}
