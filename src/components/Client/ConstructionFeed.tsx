import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HardHat, Camera, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ConstructionUpdate {
  id: string;
  date: string;
  title: string;
  description: string;
  imageUrl?: string;
  percentage: number;
}

interface ConstructionFeedProps {
  updates: ConstructionUpdate[];
}

export function ConstructionFeed({ updates }: ConstructionFeedProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardHat className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-black tracking-tight">Diário de Obra</h2>
        </div>
        <Button variant="ghost" size="sm" className="font-bold gap-2">
          Ver histórico completo <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap- layout-gap">
        {updates.length > 0 ? updates.map((update) => (
          <Card key={update.id} className="overflow-hidden border-none shadow-sem-lg group hover:translate-y-[-6px] transition-all duration-700 rounded-[2.5rem] bg-white">
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={update.imageUrl || "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&w=800&q=80"} 
                alt={update.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary/90 backdrop-blur-md border-none font-black px-3 py-1 rounded-xl shadow-lg">
                  {update.percentage}% Concluído
                </Badge>
              </div>
              <div className="absolute bottom-4 right-4">
                <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">3 fotos novas</span>
                </div>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                <Calendar className="h-3 w-3" />
                {update.date}
              </div>
              <CardTitle className="text-lg font-bold">{update.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {update.description}
              </p>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full p-20 text-center bg-muted/20 rounded-[2.5rem] border-2 border-dashed">
            <HardHat size={48} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Nenhuma atualização postada ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
