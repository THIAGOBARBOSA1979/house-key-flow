import { BarChart3, TrendingUp, CheckCircle2, AlertTriangle, Clock, Target, Calendar } from "lucide-react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { qualityService } from "@/services/operations/QualityService";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { ErrorView } from "@/components/shared/ErrorView";

const QualityIndicators = () => {
  const { user } = useAuth();
  
  const { data: metrics = [], isLoading, error, refetch } = useQuery({
    queryKey: ['quality-metrics', user?.company_id],
    queryFn: async () => {
      return await qualityService.getAll(user?.company_id, user?.is_super_admin);
    },
    enabled: !!user
  });

  const cards = [
    {
      title: "NPS Médio",
      value: "8.9",
      target: "9.0",
      change: "+0.4",
      icon: Target,
      color: "text-brand"
    },
    {
      title: "Resolução 1º Contato",
      value: "74%",
      target: "80%",
      change: "-2%",
      icon: CheckCircle2,
      color: "text-emerald-500"
    },
    {
      title: "Tempo Médio de Atendimento",
      value: "14h",
      target: "12h",
      change: "-1.5h",
      icon: Clock,
      color: "text-blue-500"
    },
    {
      title: "Taxa de Não Conformidade",
      value: "1.2%",
      target: "2.0%",
      change: "-0.3%",
      icon: AlertTriangle,
      color: "text-orange-500"
    }
  ];

  if (isLoading) return <SkeletonLoader type="page" />;
  if (error) return <ErrorView message={(error as any)?.message} onRetry={() => refetch()} />;

  return (
    <PageTemplate
      title="Indicadores de Qualidade"
      description="Dashboard de performance operacional e conformidade ISO 9001."
      icon={BarChart3}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => (
          <Card key={i} className="border-none shadow-sem-md bg-white/50 dark:bg-black/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter mb-1">{card.value}</div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${card.change.startsWith('+') ? 'text-emerald-500' : 'text-orange-500'}`}>
                  {card.change} vs mês ant.
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">Meta: {card.target}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sem-md bg-white/50 dark:bg-black/20 overflow-hidden">
          <CardHeader className="border-b border-border/10 bg-muted/20">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Evolução Mensal de Conformidade
            </CardTitle>
            <CardDescription className="text-xs">Taxa de atendimento dentro do SLA previsto pela ABNT.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            {[
              { label: "Janeiro 2026", value: 92 },
              { label: "Fevereiro 2026", value: 88 },
              { label: "Março 2026", value: 95 },
              { label: "Abril 2026", value: 91 }
            ].map((item, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-black">{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2 bg-muted/40" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sem-md bg-white/50 dark:bg-black/20 overflow-hidden">
          <CardHeader className="border-b border-border/10 bg-muted/20">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Metas de Qualidade - Q2 2026
            </CardTitle>
            <CardDescription className="text-xs">Acompanhamento de objetivos estratégicos.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            {[
              { label: "Redução de Não Conformidades", value: 65, target: "Subir 15%" },
              { label: "Tempo de Resposta em Garantia", value: 42, target: "Reduzir 2h" },
              { label: "Satisfação do Cliente (CSAT)", value: 89, target: "Manter > 85%" },
              { label: "Treinamento Técnico Equipe", value: 100, target: "Concluído" }
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/20 border border-border/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest mb-1">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground font-medium">Meta: {item.target}</div>
                </div>
                <div className="h-10 w-10 rounded-full border-2 border-primary/20 flex items-center justify-center text-[10px] font-black">
                  {item.value}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default QualityIndicators;