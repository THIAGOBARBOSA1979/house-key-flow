


import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Stats } from "@/components/Dashboard/Stats";
import { DashboardCharts } from "@/components/Dashboard/DashboardCharts";
import { PropertyCard } from "@/components/Properties/PropertyCard";
import { InspectionItem } from "@/components/Inspection/InspectionItem";
import { WarrantyClaim } from "@/components/Warranty/WarrantyClaim";
import { Calendar, ClipboardCheck, ShieldCheck, ChevronRight, Home, Plus, Activity, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { propertyService } from "@/services/PropertyService";
import { inspectionService } from "@/services/InspectionService";
import { warrantyFlowService } from "@/services/WarrantyFlowService";


const recentActivities = [
  { id: 1, user: "Roberto Oliveira", action: "aprovou a vistoria", target: "Unidade 507 - Aurora", time: "2 horas atrás", type: "inspection" },
  { id: 2, user: "Sistemas", action: "gerou lembrete de SLA", target: "Garantia #128", time: "4 horas atrás", type: "system" },
  { id: 3, user: "Ana Paula", action: "anexou documento", target: "Memorial Descritivo - Bosque", time: "5 horas atrás", type: "document" },
  { id: 4, user: "Carlos Eduardo", action: "iniciou atendimento", target: "Garantia #135", time: "Ontem", type: "warranty" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const properties = useMemo(() => propertyService.getAll().slice(0, 3), []);
  const inspections = useMemo(() => inspectionService.getAll().slice(0, 3), []);
  const warrantyClaims = useMemo(() => warrantyFlowService.getAllRequests().slice(0, 2), []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Dados atualizados", description: "O dashboard foi sincronizado com os dados mais recentes." });
    }, 800);
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <PageHeader
        icon={Home}
        title="Painel de Controle"
        description="Bem-vindo ao centro de operações da construtora"
      >
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        <Button variant="outline" onClick={() => navigate("/admin/calendar")}>
          <Calendar className="mr-2 h-4 w-4" />
          Calendário
        </Button>
        <Button onClick={() => navigate("/admin/properties")} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo Empreendimento
        </Button>
      </PageHeader>
      
      <Stats />
      
      <DashboardCharts />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Recent Properties */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2">Empreendimentos Ativos</h2>
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/admin/properties")}>
                Ver todos
                <ChevronRight size={16} />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </section>

          {/* Inspections */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 flex items-center gap-2">
                <ClipboardCheck size={24} className="text-primary" />
                Vistorias Agendadas
              </h2>
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/admin/inspections")}>
                Ver todas
                <ChevronRight size={16} />
              </Button>
            </div>
            <div className="space-y-3">
              {inspections.map((inspection) => (
                <Card key={inspection.id} className="card-standard overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30 border-l-4 border-l-primary/50">
                  <CardContent className="p-0">
                    <InspectionItem inspection={inspection} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Warranty Claims - Moved to sidebar for compact view */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 flex items-center gap-2">
                <ShieldCheck size={24} className="text-status-critical" />
                Garantias Urgentes
              </h2>
            </div>
            <div className="space-y-4">
              {warrantyClaims.map((claim) => (
                <div 
                  key={claim.id} 
                  className="card-standard p-4 interactive-active interactive-hover hover:border-amber-400/50 cursor-pointer" 
                  onClick={() => navigate("/admin/warranty")}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={claim.priority === 'high' || claim.priority === 'critical' ? 'destructive' : 'outline'}>
                      {claim.priority === 'high' ? 'Alta' : 'Crítica'}
                    </Badge>
                    <span className="text-sem-tiny text-muted-foreground">{claim.id}</span>
                  </div>
                  <h4 className="text-label line-clamp-1">{claim.title}</h4>
                  <p className="text-body-sm text-muted-foreground mt-1">{claim.propertyName} - Un. {claim.unitNumber}</p>
                </div>
              ))}
              <Button variant="outline" className="w-full text-xs" onClick={() => navigate("/admin/warranty")}>
                Gerenciar todas as garantias
              </Button>
            </div>
          </section>

          {/* Recent Activities */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 flex items-center gap-2">
                <Activity size={24} className="text-primary" />
                Feed de Atividades
              </h2>
            </div>
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <p className="text-sm leading-tight">
                        <span className="font-semibold text-primary">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span> em{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-tiny text-muted-foreground mt-1.5 flex items-center gap-1">
                        <Activity size={10} />
                        {activity.time}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t text-center">
                  <Button variant="link" size="sm" className="w-full text-xs text-muted-foreground">
                    Ver logs de auditoria
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

