import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, CreditCard, Building2, Users, FileText } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";

export const SubscriptionTab = () => {
  const { plan, limits, features, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  const allFeatures = [
    { key: "manage_properties", label: "Gestão de Empreendimentos" },
    { key: "manage_inspections", label: "Vistorias Técnicas" },
    { key: "manage_warranty", label: "Assistência Técnica" },
    { key: "advanced_reports", label: "Relatórios Avançados" },
    { key: "custom_branding", label: "White Label / Branding" },
    { key: "unlimited_users", label: "Usuários Ilimitados" },
    { key: "api_access", label: "Acesso via API" },
    { key: "priority_support", label: "Suporte Prioritário" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="overflow-hidden border-border/10">
        <CardHeader className="bg-muted/30 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <CreditCard className="text-brand h-6 w-6" />
                Seu Plano Atual: <span className="text-brand">{plan?.name || "Trial"}</span>
              </CardTitle>
              <CardDescription className="mt-2 font-medium">
                {plan?.description || "Você está no período de avaliação do sistema."}
              </CardDescription>
            </div>
            <Button className="bg-brand hover:bg-brand/90 font-bold uppercase tracking-widest text-xs h-11 px-8 rounded-xl">
              Fazer Upgrade
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-4 bg-muted/20 border-none">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="text-muted-foreground h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Empreendimentos</span>
              </div>
              <div className="text-2xl font-black">
                {limits.maxProperties === 0 ? "Ilimitado" : limits.maxProperties}
              </div>
            </Card>
            <Card className="p-4 bg-muted/20 border-none">
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-muted-foreground h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Usuários</span>
              </div>
              <div className="text-2xl font-black">
                {limits.maxUsers === 0 ? "Ilimitado" : limits.maxUsers}
              </div>
            </Card>
            <Card className="p-4 bg-muted/20 border-none">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="text-muted-foreground h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Armazenamento</span>
              </div>
              <div className="text-2xl font-black">
                {limits.maxStorageMb === 0 ? "Ilimitado" : `${limits.maxStorageMb} MB`}
              </div>
            </Card>
          </div>

          <Separator className="my-8" />

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Recursos do Plano</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allFeatures.map((f) => {
                const has = features.includes(f.key as any);
                return (
                  <div key={f.key} className="flex items-center gap-3 p-3 rounded-xl border border-border/5 text-sm">
                    {has ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                    )}
                    <span className={has ? "font-bold text-foreground" : "text-muted-foreground/50"}>
                      {f.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Separator = ({ className }: { className?: string }) => <div className={`h-[1px] w-full bg-border/10 ${className}`} />;
