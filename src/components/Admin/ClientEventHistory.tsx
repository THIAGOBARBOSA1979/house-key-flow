
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History,
  UserPlus,
  ClipboardCheck,
  ShieldCheck,
  Calendar,
  Bot,
  User
} from "lucide-react";
import { ClientEvent, EventType } from "@/types/clientFlow";
import { clientStageService } from "@/services/ClientStageService";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ClientEventHistoryProps {
  clientId: string;
}

const getEventIcon = (type: EventType) => {
  switch (type) {
    case 'client_registered':
      return UserPlus;
    case 'inspection_enabled':
    case 'inspection_scheduled':
    case 'inspection_completed':
    case 'inspection_approved':
    case 'inspection_rejected':
      return ClipboardCheck;
    case 'warranty_enabled':
    case 'warranty_requested':
    case 'warranty_completed':
      return ShieldCheck;
    default:
      return Calendar;
  }
};

const getEventColor = (type: EventType): string => {
  if (type.includes('rejected')) return 'text-red-600 bg-red-100';
  if (type.includes('approved') || type.includes('completed')) return 'text-green-600 bg-green-100';
  if (type.includes('enabled')) return 'text-blue-600 bg-blue-100';
  if (type.includes('scheduled')) return 'text-amber-600 bg-amber-100';
  return 'text-muted-foreground bg-muted';
};

export function ClientEventHistory({ clientId }: ClientEventHistoryProps) {
  const events = clientStageService.getEvents(clientId);

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <History className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum evento registrado</p>
        </CardContent>
      </Card>
    );
  }

  // Sort events by date, most recent first
  const sortedEvents = [...events].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Eventos
        </CardTitle>
        <CardDescription>
          Todos os eventos registrados para este cliente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {sortedEvents.map((event, index) => {
              const Icon = getEventIcon(event.eventType);
              const colorClass = getEventColor(event.eventType);
              const isAutomatic = event.metadata?.isAutomatic;

              return (
                <div 
                  key={event.id}
                  className="relative pl-8"
                >
                  {/* Vertical line */}
                  {index < sortedEvents.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-px bg-border -translate-x-1/2 h-full" />
                  )}
                  
                  {/* Event dot */}
                  <div className={cn(
                    "absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center",
                    colorClass.split(' ')[1]
                  )}>
                    <Icon className={cn("h-3 w-3", colorClass.split(' ')[0])} />
                  </div>
                  
                  {/* Event content */}
                  <div className="pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        {isAutomatic ? (
                          <>
                            <Bot className="h-3 w-3 mr-1" />
                            Automático
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-1" />
                            Manual
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{format(event.createdAt, "dd/MM/yyyy 'às' HH:mm")}</span>
                      {event.metadata?.performedBy && (
                        <>
                          <span>•</span>
                          <span>Por: {event.metadata.performedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
