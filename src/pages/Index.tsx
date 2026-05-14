
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Stats } from "@/components/Dashboard/Stats";
import { DashboardCharts } from "@/components/Dashboard/DashboardCharts";
import { PropertyCard } from "@/components/Properties/PropertyCard";
import { InspectionItem } from "@/components/Inspection/InspectionItem";
import { WarrantyClaim } from "@/components/Warranty/WarrantyClaim";
import { Calendar, ClipboardCheck, ShieldCheck, ChevronRight, Home, Plus, Activity } from "lucide-react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// Mock data
const recentProperties = [
  {
    id: "1",
    name: "Edifício Aurora",
    location: "São Paulo, SP",
    units: 120,
    completedUnits: 85,
    status: "progress" as const,
  },
  {
    id: "2",
    name: "Residencial Bosque Verde",
    location: "Rio de Janeiro, RJ",
    units: 75,
    completedUnits: 75,
    status: "complete" as const,
  },
  {
    id: "3",
    name: "Condomínio Monte Azul",
    location: "Belo Horizonte, MG",
    units: 50,
    completedUnits: 10,
    status: "pending" as const,
  },
];

const upcomingInspections = [
  {
    id: "1",
    property: "Edifício Aurora",
    unit: "507",
    client: "Carlos Silva",
    scheduledDate: new Date(2025, 4, 19, 10, 0),
    status: "pending" as const,
  },
  {
    id: "2",
    property: "Edifício Aurora",
    unit: "204",
    client: "Maria Oliveira",
    scheduledDate: new Date(2025, 4, 19, 14, 30),
    status: "pending" as const,
  },
];

const recentWarrantyClaims = [
  {
    id: "1",
    title: "Infiltração no banheiro",
    property: "Residencial Bosque Verde",
    unit: "305",
    client: "Ana Santos",
    description: "Identificada infiltração na parede do box do banheiro social. Já está causando mofo e descascamento da pintura.",
    createdAt: new Date(2025, 4, 15),
    status: "critical" as const,
  },
  {
    id: "2",
    title: "Porta empenada",
    property: "Edifício Aurora",
    unit: "108",
    client: "João Mendes",
    description: "A porta do quarto principal está empenada e não fecha corretamente.",
    createdAt: new Date(2025, 4, 16),
    status: "progress" as const,
  },
];

const recentActivities = [
  { id: 1, user: "Roberto Oliveira", action: "aprovou a vistoria", target: "Unidade 507 - Aurora", time: "2 horas atrás", type: "inspection" },
  { id: 2, user: "Sistemas", action: "gerou lembrete de SLA", target: "Garantia #128", time: "4 horas atrás", type: "system" },
  { id: 3, user: "Ana Paula", action: "anexou documento", target: "Memorial Descritivo - Bosque", time: "5 horas atrás", type: "document" },
  { id: 4, user: "Carlos Eduardo", action: "iniciou atendimento", target: "Garantia #135", time: "Ontem", type: "warranty" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        icon={Home}
        title="Dashboard"
        description="Visão geral do sistema de gestão de entregas e garantias"
      >
        <Button variant="outline" onClick={() => navigate("/admin/calendar")}>
          <Calendar className="mr-2 h-4 w-4" />
          Calendário
        </Button>
        <Button onClick={() => navigate("/admin/properties")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Empreendimento
        </Button>
      </PageHeader>
      
      <Stats />
      
      <DashboardCharts />
      
      {/* Recent Properties */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Empreendimentos Recentes</h2>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/admin/properties")}>
            Ver todos
            <ChevronRight size={16} />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>
      
      {/* Two columns for bottom sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Inspections */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ClipboardCheck size={20} />
                Próximas Vistorias
              </h2>
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/admin/inspections")}>
                Ver todas
                <ChevronRight size={16} />
              </Button>
            </div>
            <div className="space-y-3">
              {upcomingInspections.map((inspection) => (
                <Card key={inspection.id} className="overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-0">
                    <InspectionItem inspection={inspection} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
          
          {/* Warranty Claims */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShieldCheck size={20} />
                Solicitações de Garantia Recentes
              </h2>
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/admin/warranty")}>
                Ver todas
                <ChevronRight size={16} />
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recentWarrantyClaims.map((claim) => (
                <WarrantyClaim 
                  key={claim.id} 
                  claim={claim}
                  onAtender={() => toast({ title: "Atendimento iniciado", description: `Garantia "${claim.title}" está sendo atendida. Sincronizando com workflow...` })}
                  onGerenciarProblemas={() => toast({ title: "Gerenciando problemas", description: `Abrindo gerenciamento de problemas para "${claim.title}".` })}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar on Dashboard */}
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity size={20} />
                Atividades Recentes
              </h2>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.user}</span>{" "}
                        {activity.action} em{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t text-center">
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => toast({ title: "Histórico completo", description: "Carregando todo o log de atividades do sistema..." })}>
                    Ver todo o histórico
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="bg-primary text-primary-foreground overflow-hidden">
              <CardContent className="p-6 space-y-4 relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldCheck size={80} />
                </div>
                <h3 className="font-bold text-lg">Suporte Premium</h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  Precisa de ajuda com alguma configuração avançada do sistema?
                </p>
                <Button variant="secondary" size="sm" className="w-full font-semibold relative z-10" onClick={() => toast({ title: "Suporte", description: "Conectando ao canal de suporte prioritário..." })}>
                  Falar com Consultor
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
