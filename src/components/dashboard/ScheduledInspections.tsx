import { useNavigate } from "react-router-dom";
import { ChevronRight, ClipboardCheck, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InspectionItem } from "@/components/inspection/InspectionItem";
import { Inspection } from "@/services";
import { EmptyState } from "@/components/shared/EmptyState";
import { ScheduleInspectionDialog } from "@/components/inspection/ScheduleInspectionDialog";

interface ScheduledInspectionsProps {
  inspections: Inspection[];
}

export const ScheduledInspections = ({ inspections }: ScheduledInspectionsProps) => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-h3 flex items-center gap-3 font-black uppercase tracking-tighter">
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
      <div className="layout-stack animate-in fade-in slide-in-from-left-4 duration-slow">
        {inspections && inspections.length > 0 ? (
          inspections.map((inspection) => (
            <Card key={inspection.id} className="card-standard overflow-hidden border border-border/10 bg-card/40 backdrop-blur-3xl card-hover-effect rounded-3xl shadow-sem-sm hover:shadow-sem-xl transition-all duration-500 group/item relative">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary/40 group-hover/item:bg-primary transition-colors"></div>
              <CardContent className="p-0">
                <InspectionItem inspection={inspection as any} onUpdate={() => navigate("/admin/inspections")} />
              </CardContent>
            </Card>

          ))

        ) : (
          <EmptyState
            icon={CalendarPlus}
            title="Nenhuma Vistoria Agendada"
            description="Mantenha sua produtividade em alta. Agende novas vistorias técnicas para garantir a qualidade das entregas."
            action={
              <ScheduleInspectionDialog 
                triggerButton={
                  <Button className="font-black uppercase tracking-widest text-[11px] px-8 h-12 rounded-xl shadow-sem-lg active:scale-95 transition-all">
                    Agendar Agora
                  </Button>
                }
              />
            }
          />
        )}
      </div>
    </section>
  );
};
