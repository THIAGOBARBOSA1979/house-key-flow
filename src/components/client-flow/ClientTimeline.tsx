
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TimelineItem } from "@/types/clientFlow";
import { TimelineItemComponent } from "./TimelineItem";
import { History } from "lucide-react";

interface client-timelineProps {
  timeline: TimelineItem[];
  title?: string;
  description?: string;
  compact?: boolean;
}

export function client-timeline({ 
  timeline, 
  title = "Linha do Tempo",
  description = "Acompanhe o progresso do seu imóvel",
  compact = false
}: client-timelineProps) {
  if (timeline.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <History className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-center">
            Nenhum evento registrado ainda
          </p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-0">
        {timeline.map((item, index) => (
          <TimelineItemComponent 
            key={item.id} 
            item={item} 
            isLast={index === timeline.length - 1}
          />
        ))}
      </div>
    );
  }

  return (
    <Card className="border-none shadow-sem-lg rounded-[2.5rem] overflow-hidden bg-white/60 backdrop-blur-md">
      <CardHeader className="p-8 border-b border-border/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
            <History className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-black tracking-tight">{title}</CardTitle>
            <CardDescription className="font-bold text-muted-foreground/80">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-0">
          {timeline.map((item, index) => (
            <TimelineItemComponent 
              key={item.id} 
              item={item} 
              isLast={index === timeline.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
