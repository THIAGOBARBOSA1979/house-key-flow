
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConstructionUpdate } from "@/services/ConstructionService";
import { Calendar, Camera, FileText, Video, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ConstructionFeedProps {
  updates: ConstructionUpdate[];
}

export const ConstructionFeed = ({ updates }: ConstructionFeedProps) => {
  const getIcon = (type: ConstructionUpdate['type']) => {
    switch (type) {
      case 'photo': return Camera;
      case 'video': return Video;
      case 'document': return FileText;
      default: return Calendar;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight">Evolução da Obra</h3>
        <Button variant="ghost" size="sm" className="text-primary font-bold gap-1">
          Ver tudo <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {updates.map((update) => {
          const Icon = getIcon(update.type);
          return (
            <Card key={update.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                {update.imageUrl && (
                  <div className="md:col-span-1 h-48 md:h-full relative overflow-hidden">
                    <img 
                      src={update.imageUrl} 
                      alt={update.title}
                      className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
                    />
                    <Badge className="absolute top-2 left-2 bg-black/50 backdrop-blur-md border-none">
                      {update.date.toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                )}
                <div className={update.imageUrl ? "md:col-span-2 p-6" : "p-6"}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary">
                        <Icon className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {update.type === 'milestone' ? 'Marco da Obra' : 'Atualização'}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold">{update.title}</CardTitle>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {update.description}
                  </p>
                  
                  {update.progressItems && (
                    <div className="grid grid-cols-2 gap-4">
                      {update.progressItems.map((item) => (
                        <div key={item.label} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold uppercase">
                            <span>{item.label}</span>
                            <span>{item.percentage}%</span>
                          </div>
                          <Progress value={item.percentage} className="h-1.5" />
                        </div>
                      ))}
                    </div>
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
