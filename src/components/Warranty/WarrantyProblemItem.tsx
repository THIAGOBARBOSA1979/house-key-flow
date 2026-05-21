
import { useState } from "react";
import { Trash2, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Categories for warranty claims
const warrantyCategories = [
  "Instalações Hidráulicas",
  "Instalações Elétricas",
  "Estrutura", 
  "Impermeabilização",
  "Revestimentos e Acabamentos",
  "Esquadrias e Vidros",
  "Equipamentos e Máquinas",
  "Pintura",
  "Outros"
];

// Severity options
const severityOptions = [
  { value: "low", label: "Leve (Estético/Funcionalidade Parcial)" },
  { value: "moderate", label: "Moderada (Comprometimento de Uso)" },
  { value: "high", label: "Grave (Risco Imediato/Dano Estrutural)" },
];

export interface WarrantyProblem {
  id: string;
  category: string;
  location: string;
  description: string;
  severity: string;
  photos: string[];
}

interface WarrantyProblemItemProps {
  index: number;
  problem: WarrantyProblem;
  onChange: (index: number, field: keyof WarrantyProblem, value: any) => void;
  onRemove: (index: number) => void;
}

export function WarrantyProblemItem({ 
  index, 
  problem, 
  onChange, 
  onRemove 
}: WarrantyProblemItemProps) {
  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Convert file to data URL for preview
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const updatedPhotos = [...problem.photos, reader.result];
        onChange(index, 'photos', updatedPhotos);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };
  
  // Remove a photo
  const removePhoto = (photoIndex: number) => {
    const updatedPhotos = problem.photos.filter((_, i) => i !== photoIndex);
    onChange(index, 'photos', updatedPhotos);
  };
  
  return (
    <div className="space-y-6 p-6 md:p-8 rounded-[2rem] bg-white/40 border-2 border-border/5 shadow-inner relative group/problem transition-all hover:bg-white/60">
      {index > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover/problem:opacity-100 shadow-sm"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      
      <h3 className="font-black text-xs uppercase tracking-widest text-primary/60 mb-2">
        {index === 0 ? "Ocorrência Principal" : `Ocorrência Adicional #${index}`}
      </h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Categoria Técnica <span className="text-destructive">*</span></FormLabel>
          <Select 
            value={problem.category} 
            onValueChange={(value) => onChange(index, 'category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {warrantyCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ambiente / Local <span className="text-destructive">*</span></FormLabel>
          <Input 
            placeholder="Ex: Banheiro da suíte, Cozinha" 
            value={problem.location}
            onChange={(e) => onChange(index, 'location', e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Severidade Percebida <span className="text-destructive">*</span></FormLabel>
        <Select 
          value={problem.severity}
          onValueChange={(value) => onChange(index, 'severity', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a gravidade" />
          </SelectTrigger>
          <SelectContent>
            {severityOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Descrição do Vício ou Defeito <span className="text-destructive">*</span></FormLabel>
        <Textarea 
          placeholder="Descreva quando começou, sintomas observados, riscos aparentes, etc."
          rows={3}
          value={problem.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
        />
      </div>
      
      {/* Photo upload section */}
      <div className="space-y-3">
        <div>
          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Evidências Fotográficas</FormLabel>
          <p className="text-xs text-muted-foreground">
            Adicione fotos que mostrem claramente o problema para facilitar a análise
          </p>
        </div>
        
        {/* Photo grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {problem.photos.map((photo, photoIndex) => (
            <div key={photoIndex} className="relative aspect-square rounded-md overflow-hidden border">
              <img 
                src={photo} 
                alt={`Foto ${photoIndex + 1}`} 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(photoIndex)}
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
    </div>
  );
}
