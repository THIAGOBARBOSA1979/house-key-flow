
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TimelineItem } from "@/types/clientFlow";
import { TimelineItemComponent } from "./TimelineItem";
import { History } from "lucide-react";

interface ClientTimelineProps {
  timeline: TimelineItem[];
  title?: string;
  description?: string;
  compact?: boolean;
}

export function ClientTimeline({ 
  timeline, 
  title = "Linha do Tempo",
  description = "Acompanhe o progresso do seu imóvel",
  compact = false
}: ClientTimelineProps) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
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
