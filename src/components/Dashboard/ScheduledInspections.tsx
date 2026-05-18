import { useNavigate } from "react-router-dom";
import { ChevronRight, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InspectionItem } from "@/components/Inspection/InspectionItem";
import { Inspection } from "@/services/InspectionService";

interface ScheduledInspectionsProps {
  inspections: Inspection[];
}

export const ScheduledInspections = ({ inspections }: ScheduledInspectionsProps) => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-h2 flex items-center gap-2 font-black">
          <ClipboardCheck className="text-primary h-5 w-5 md:h-6 md:w-6" />
          Vistorias Agendadas
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 font-bold text-primary" 
          onClick={() => navigate("/admin/inspections")}
        >
          Ver todas
          <ChevronRight size={16} />
        </Button>
      </div>
      <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-slow">
        {inspections.length > 0 ? (
          inspections.map((inspection) => (
            <Card key={inspection.id} className="card-standard overflow-hidden border-none bg-card/40 backdrop-blur-md card-hover-effect rounded-2xl shadow-sem-sm hover:shadow-sem-md transition-all">
              <CardContent className="p-0">
                <InspectionItem inspection={inspection as any} onUpdate={() => navigate("/admin/inspections")} />
              </CardContent>
            </Card>
          ))

        ) : (
          <div className="py-12 text-center bg-muted/10 rounded-2xl border border-dashed">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Nenhuma vistoria para hoje</p>
          </div>
        )}
      </div>
    </section>
  );
};
