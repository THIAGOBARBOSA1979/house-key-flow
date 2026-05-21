import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Camera, Trash2, Loader2 } from "lucide-react";
import { ChecklistItem } from "@/services";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { FileService } from "@/services/core/FileService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface ChecklistItemCardProps {
  item: ChecklistItem;
  onConformityChange: (value: "conform" | "nonconform") => void;
  onNotesChange: (notes: string) => void;
  onPhotosChange?: (photos: string[]) => void;
  inspectionId?: string;
}

export const ChecklistItemCard = ({ 
  item, 
  onConformityChange, 
  onNotesChange, 
  onPhotosChange,
  inspectionId 
}: ChecklistItemCardProps) => {
  const [photos, setPhotos] = useState<string[]>(item.photos || []);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user || !inspectionId) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => 
        FileService.uploadInspectionPhoto(file, user.company_id || 'general', inspectionId)
      );
      
      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter((url): url is string => url !== null);
      
      const newPhotos = [...photos, ...validUrls];
      setPhotos(newPhotos);
      onPhotosChange?.(newPhotos);
      
      toast({
        title: "Fotos anexadas",
        description: `${validUrls.length} fotos foram carregadas com sucesso.`
      });
    } catch (error) {
      console.error("Upload error", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível carregar as imagens.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosChange?.(newPhotos);
  };

  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-sm backdrop-blur-sm transition-all duration-300",
      item.conformity === "nonconform" ? "bg-red-50/50 dark:bg-red-950/10 ring-1 ring-red-200/50" : "bg-card/50"
    )}>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="font-bold text-sm leading-tight text-foreground/90">{item.name || item.description}</span>
            <p className="text-[10px] text-primary uppercase tracking-widest font-black opacity-80">
              {item.abntReference || "Requisito Técnico ABNT"}
            </p>
            {item.inspectionMethod && (
              <p className="text-[9px] text-muted-foreground italic">
                Método: {item.inspectionMethod}
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant={item.conformity === "conform" ? "default" : "outline"}
              className={cn(
                "rounded-xl font-bold h-9 px-4 transition-all active:scale-95",
                item.conformity === "conform" ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20" : "hover:border-emerald-500 hover:text-emerald-600"
              )}
              onClick={() => onConformityChange("conform")}
            >
              <Check className="h-3.5 w-3.5 mr-1.5" strokeWidth={3} /> Conforme
            </Button>
            <Button
              size="sm"
              variant={item.conformity === "nonconform" ? "default" : "outline"}
              className={cn(
                "rounded-xl font-bold h-9 px-4 transition-all active:scale-95",
                item.conformity === "nonconform" ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20" : "hover:border-red-500 hover:text-red-600"
              )}
              onClick={() => onConformityChange("nonconform")}
            >
              <X className="h-3.5 w-3.5 mr-1.5" strokeWidth={3} /> Falha
            </Button>
          </div>
        </div>

        {item.conformity && item.conformity !== "pending" && (
          <div className="animate-in slide-in-from-top-2 duration-300 space-y-4 pt-2 border-t border-border/40">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Evidências Fotográficas</label>
              <div className="flex flex-wrap gap-3">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative group/photo w-20 h-20 rounded-xl overflow-hidden border border-border/50 shadow-sm">
                    <img src={photo} alt="Evidência" className="w-full h-full object-cover transition-transform group-hover/photo:scale-110" />
                    <button 
                      onClick={() => removePhoto(idx)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} className="text-white" />
                    </button>
                  </div>
                ))}
                
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:border-primary/40 transition-all text-muted-foreground hover:text-primary group disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Camera size={18} className="group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-[8px] font-black uppercase">{isUploading ? 'Enviando...' : 'Anexar'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Parecer Técnico / Notas</label>
              <Textarea
                placeholder="Descreva detalhes técnicos, medidas ou justificativas da conformidade..."
                className="text-xs min-h-[80px] bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all rounded-xl resize-none"
                value={item.notes || ""}
                onChange={e => onNotesChange(e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
