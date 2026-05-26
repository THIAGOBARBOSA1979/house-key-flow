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
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-border/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary text-white rounded-2xl shadow-lg">
            <HardHat className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tighter">Diário de Obra</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Acompanhamento Estrutural em Tempo Real</p>
          </div>
        </div>
        <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] gap-2 rounded-xl hover:bg-primary/5">
          Linha do Tempo <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-layout-gap">
        {updates.length > 0 ? updates.map((update) => (
          <Card key={update.id} className="overflow-hidden border-none shadow-2xl group hover:translate-y-[-8px] transition-all duration-700 rounded-[3rem] bg-white flex flex-col h-full">
            <div className="aspect-[16/10] relative overflow-hidden">
              <img 
                src={update.imageUrl || "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&w=800&q=80"} 
                alt={update.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-slow"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
              <div className="absolute top-6 left-6">
                <Badge className="bg-white text-primary border-none font-black px-4 py-1.5 rounded-xl shadow-2xl uppercase tracking-widest text-[10px]">
                  {update.percentage}% Concluído
                </Badge>
              </div>
              <div className="absolute bottom-6 right-6">
                <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20">
                  <Camera className="h-5 w-5 text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Relatório Visual</span>
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
