

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConstructionUpdate } from "@/services";
import { Calendar, Camera, FileText, Video, ChevronRight, Newspaper, Bell, PlayCircle, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ConstructionFeedProps {
  updates: ConstructionUpdate[];
}

export const ConstructionFeed = ({ updates }: ConstructionFeedProps) => {
  const getIcon = (type: ConstructionUpdate['type']) => {
    switch (type) {
      case 'photo': return Camera;
      case 'video': return Video;
      case 'document': return FileText;
      case 'news': return Newspaper;
      default: return Calendar;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Feed de Atualizações e Novidades
        </h3>
        <Button variant="ghost" size="sm" className="text-primary font-bold gap-1">
          Ver tudo <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {updates.map((update) => {
          const Icon = getIcon(update.type);
          const isNews = update.type === 'news';
          
          return (
            <Card key={update.id} className={cn(
              "overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2rem] group/card",
              isNews && "bg-primary/5 border-l-8 border-primary"
            )}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                {update.imageUrl && (
                  <div className="md:col-span-4 h-64 md:h-auto relative overflow-hidden">
                    <img 
                      src={update.imageUrl} 
                      alt={update.title}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover/card:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3">
                       <Button size="icon" variant="secondary" className="rounded-full bg-white/20 backdrop-blur-md border-none text-white hover:bg-white/40">
                         <Maximize2 className="h-5 w-5" />
                       </Button>
                       {update.type === 'video' && (
                         <Button size="icon" variant="secondary" className="rounded-full bg-primary/80 backdrop-blur-md border-none text-white hover:bg-primary">
                           <PlayCircle className="h-6 w-6" />
                         </Button>
                       )}
                    </div>
                    <Badge className="absolute top-4 left-4 bg-black/50 backdrop-blur-md border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full">
                      {update.date.toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                )}
                <div className={cn(
                  update.imageUrl ? "md:col-span-8 p-8" : "md:col-span-12 p-8",
                  !update.imageUrl && "flex flex-col justify-center"
                )}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary">
                        <Icon className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {isNews ? 'Novidade' : (update.type === 'milestone' ? 'Marco da Obra' : 'Atualização')}
                        </span>
                      </div>
                      <CardTitle className={cn(
                        "font-bold",
                        isNews ? "text-lg" : "text-xl"
                      )}>{update.title}</CardTitle>
                    </div>
                    {!update.imageUrl && (
                       <Badge variant="outline" className="text-[10px] font-bold">
                         {update.date.toLocaleDateString('pt-BR')}
                       </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {update.description}
                  </p>
                  
                  {update.progressItems && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-2xl border border-border/5">
                      {update.progressItems.map((item) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                            <span>{item.label}</span>
                            <span className="text-primary">{item.percentage}%</span>
                          </div>
                          <Progress value={item.percentage} className="h-2 bg-primary/10" />
                        </div>
                      ))}
                    </div>
                  )}

                  {isNews && (
                    <Button size="sm" variant="outline" className="w-fit rounded-xl font-bold text-[10px] uppercase h-8">
                      Saber mais
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
