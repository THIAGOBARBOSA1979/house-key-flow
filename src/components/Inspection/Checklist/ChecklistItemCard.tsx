
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Camera, Image as ImageIcon, Trash2 } from "lucide-react";
import { ChecklistItem } from "@/services";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChecklistItemCardProps {
  item: ChecklistItem;
  onConformityChange: (value: "conform" | "nonconform") => void;
  onNotesChange: (notes: string) => void;
}

export const ChecklistItemCard = ({ item, onConformityChange, onNotesChange }: ChecklistItemCardProps) => {
  const [photos, setPhotos] = useState<string[]>([]);

  const handleAddMockPhoto = () => {
    // Simulando adição de foto para evidência técnica
    const mockPhotos = [
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=200&q=80",
      "https://images.unsplash.com/photo-1503387762-592dee58c460?auto=format&fit=crop&w=200&q=80"
    ];
    const newPhoto = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
    setPhotos(prev => [...prev, newPhoto]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
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
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Requisito Técnico ABNT</p>
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
                <button 
                  onClick={handleAddMockPhoto}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:border-primary/40 transition-all text-muted-foreground hover:text-primary group"
                >
                  <Camera size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black uppercase">Anexar</span>
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

