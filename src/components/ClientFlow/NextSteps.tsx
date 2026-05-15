
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  link?: string;
}

interface NextStepsProps {
  steps: Step[];
}

export function NextSteps({ steps }: NextStepsProps) {
  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Próximos Passos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col">
          {steps.map((step, idx) => (
            <div 
              key={step.id} 
              className={cn(
                "flex items-start gap-4 p-4 border-b last:border-0 transition-colors",
                step.status === 'current' ? "bg-primary/[0.02]" : "hover:bg-muted/30"
              )}
            >
              <div className="mt-1">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-status-complete" />
                ) : step.status === 'current' ? (
                  <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  </div>
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30" />
                )}
              </div>
              <div className="flex-1">
                <h4 className={cn(
                  "text-sm font-bold",
                  step.status === 'completed' ? "text-muted-foreground line-through" : "text-foreground"
                )}>
                  {step.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                {step.status === 'current' && step.link && (
                  <Link to={step.link}>
                    <Button variant="link" className="p-0 h-auto text-xs font-bold text-primary mt-2 group">
                      Realizar agora <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
