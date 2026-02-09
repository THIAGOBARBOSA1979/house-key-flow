import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Stats } from "@/components/Dashboard/Stats";
import { PropertyCard } from "@/components/Properties/PropertyCard";
import { InspectionItem } from "@/components/Inspection/InspectionItem";
import { WarrantyClaim } from "@/components/Warranty/WarrantyClaim";
import { Calendar, ClipboardCheck, ShieldCheck, ChevronRight, Home, Plus } from "lucide-react";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="space-y-8">
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
              onAtender={() => toast({ title: "Atendimento iniciado", description: `Garantia "${claim.title}" está sendo atendida.` })}
              onGerenciarProblemas={() => toast({ title: "Gerenciando problemas", description: `Abrindo gerenciamento de problemas para "${claim.title}".` })}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
