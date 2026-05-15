
import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChecklistItem, ChecklistGroup } from '@/services/ChecklistService';
import { Check, X, AlertCircle, ArrowLeft, Camera, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ChecklistDetailProps {
  title: string;
  description: string;
  groups: ChecklistGroup[];
  readOnly?: boolean;
  onBack: () => void;
}

export const ChecklistDetail = ({ 
  title, 
  description, 
  groups,
  readOnly = false,
  onBack
}: ChecklistDetailProps) => {
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack} className="rounded-xl h-10 w-10">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-black tracking-tight">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      
      {groups.map((group) => (
        <Card key={group.id} className="border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
              {group.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/10">
              {group.items.map(item => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">{item.description}</span>
                        {item.required && (
                          <Badge variant="destructive" className="text-[9px] font-black uppercase px-1.5 h-4">Obrigatório</Badge>
                        )}
                        <Badge variant="outline" className="text-[9px] font-black uppercase px-1.5 h-4 border-primary/20">{item.severity}</Badge>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "px-2 py-0.5 text-[10px] font-black uppercase rounded-lg",
                      item.status === "ok" ? "bg-status-complete/10 text-status-complete" :
                      item.status === "issue" ? "bg-status-error/10 text-status-error" :
                      item.status === "na" ? "bg-muted text-muted-foreground" : "bg-amber-100 text-amber-800"
                    )}>
                      {item.status === "ok" ? "OK" : 
                       item.status === "issue" ? "Problema" :
                       item.status === "na" ? "N/A" : "Pendente"}
                    </div>
                  </div>

                  {item.evidence && item.evidence.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {item.evidence.map((ev) => (
                        <div key={ev.id} className="relative shrink-0">
                          <img 
                            src={ev.url} 
                            alt="Evidência" 
                            className="h-12 w-12 object-cover rounded-md border border-white shadow-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {item.notes && (
                    <div className="flex items-start gap-2 bg-muted/20 p-2 rounded-lg">
                      <Info size={12} className="text-muted-foreground mt-0.5" />
                      <p className="text-xs text-muted-foreground italic">{item.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
