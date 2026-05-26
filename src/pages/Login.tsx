import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Building2, 
  Shield, 
  Users,
  Settings,
  BarChart3,
  CheckCircle2,
  Star,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthForm } from "@/hooks/identity/useAuthForm";
import { LoginForm } from "@/components/auth/LoginForm";
import { useTenant } from "@/contexts/TenantContext";

export default function Login() {
  const { tenant, isLoading: isTenantLoading } = useTenant();
  const [activeTab, setActiveTab] = useState("client");
  const authForm = useAuthForm(activeTab);
  const navigate = useNavigate();

  useEffect(() => {
    if (tenant && activeTab === 'master') {
      setActiveTab('client');
    }
  }, [tenant]);

  const adminFeatures = [
    {
      icon: Users,
      title: "Inteligência de Equipe",
      description: "Governança completa de acessos, perfis e produtividade do time."
    },
    {
      icon: Building2,
      title: "Ecossistema de Portfólio", 
      description: "Visão estratégica e detalhada de todos os seus empreendimentos."
    },
    {
      icon: BarChart3,
      title: "Analytics de Decisão",
      description: "Insights em tempo real para otimizar a saúde do seu negócio."
    },
    {
      icon: Settings,
      title: "Arquitetura Customizável",
      description: "Configure fluxos e regras que se adaptam à sua operação."
    }
  ];

  const clientBenefits = [
    {
      icon: Building2,
      title: "Seu Imóvel na Palma da Mão",
      description: "Acesse documentos, plantas e o histórico completo do seu patrimônio."
    },
    {
      icon: CheckCircle2,
      title: "Vistorias sem Fricção",
      description: "Acompanhe cronogramas e aprove vistorias com total segurança jurídica."
    },
    {
      icon: Shield,
      title: "Suporte de Excelência",
      description: "Solicite e acompanhe garantias com a agilidade que você merece."
    }
  ];

  const stats = [
    { value: "98%", label: "Satisfação", icon: Star },
    { value: "2.5k+", label: "Clientes Ativos", icon: Users },
    { value: "15+", label: "Anos de Mercado", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-50/50 via-background to-brand/5 dark:from-background dark:to-background overflow-x-hidden">
      <header className="border-b border-border/5 bg-background/40 backdrop-blur-3xl sticky top-0 z-sticky transition-all duration-500">
        <div className="container-responsive py-5">

          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center gap-3">
              {tenant?.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.brand_name || tenant.name} className="h-14 object-contain" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand via-primary to-indigo-600 flex items-center justify-center text-brand-foreground font-black text-2xl shadow-xl shadow-brand/20 group-hover:rotate-6 transition-all duration-500">
                  {tenant?.name?.substring(0, 2).toUpperCase() || "A2"}
                </div>
              )}
              <div>
                <h1 className="text-h2 font-black tracking-tighter text-foreground">
                  {tenant?.brand_name || tenant?.name || "A2 Incorporadora"}
                </h1>
                <p className="text-label text-brand uppercase tracking-widest">
                  {tenant ? "Portal do Parceiro" : "Sistema de Gestão"}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-primary/10">
                  <Shield className="h-4 w-4" />
                  {activeTab === "admin" ? "Área Administrativa" : "Portal do Cliente"}
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-foreground leading-[1] tracking-tighter">
                  {activeTab === "admin" ? (
                    <>
                      Domine sua operação com
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-primary to-indigo-600"> inteligência estratégica</span>
                    </>
                  ) : (
                    <>
                      Experiência premium para o
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-primary to-indigo-600"> seu novo lar</span>
                    </>
                  )}
                </h2>
                <p className="text-body-lg text-muted-foreground leading-relaxed font-medium">
                  {activeTab === "admin" 
                    ? "O centro de comando definitivo para gerir incorporadoras de alta performance com segurança e agilidade."
                    : "Acesse seu ecossistema exclusivo e gerencie seu imóvel, vistorias e garantias com o padrão A2 de excelência."
                  }
                </p>
              </div>

              {activeTab === "client" && (
                <div className="grid grid-cols-3 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-3 border border-primary/10 shadow-sem-sm transition-transform hover:scale-110">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</div>

                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-6">
                {(activeTab === "admin" ? adminFeatures : clientBenefits).map((item, index) => (
                  <div key={index} className="flex items-start gap-5 p-5 rounded-[1.5rem] hover:bg-white/60 transition-all duration-300 border border-transparent hover:border-border/10 hover:shadow-sem-md group">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sem-sm">
                      <item.icon className="h-7 w-7 text-primary" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-black text-foreground mb-1 text-lg tracking-tight group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sem-body-sm">{item.description}</p>
                    </div>
                  </div>

                ))}
              </div>
            </div>

            <div className="flex justify-center animate-in fade-in slide-in-from-right-8 duration-1000">
              <Card className="w-full max-w-md shadow-sem-2xl border border-border/20 bg-white/70 dark:bg-black/60 backdrop-blur-3xl mx-auto rounded-[2.5rem] overflow-hidden">

                <CardHeader className="space-y-4 pb-8">
                  <div className="text-center">
                    <CardTitle className="text-h2 font-black tracking-tight text-foreground">
                      {activeTab === "admin" ? "Acesso Administrativo" : "Bem-vindo de volta"}
                    </CardTitle>
                    <CardDescription className="mt-3 text-base text-gray-600">
                      {activeTab === "admin" 
                        ? "Entre com suas credenciais de administrador"
                        : "Digite suas credenciais para acessar seu portal exclusivo"
                      }
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1.5 rounded-2xl h-14">
                      <TabsTrigger value="client" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:shadow-sem-md transition-all">Portal</TabsTrigger>
                      <TabsTrigger value="admin" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:shadow-sem-md transition-all">Admin</TabsTrigger>
                      <TabsTrigger value="register" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:shadow-sem-md transition-all">Adesão</TabsTrigger>
                      <TabsTrigger value="master" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:shadow-sem-md transition-all">Master</TabsTrigger>
                    </TabsList>




                    <TabsContent value="client" className="mt-6">
                      <LoginForm 
                        {...authForm} 
                        onSubmit={authForm.handleLogin}
                        forgotPasswordLink="/forgot-password"
                        submitButtonText="Entrar no Portal"
                      />
                    </TabsContent>

                    <TabsContent value="admin" className="mt-6">
                      <LoginForm 
                        {...authForm} 
                        onSubmit={authForm.handleLogin}
                        forgotPasswordLink="/forgot-password"
                        submitButtonText="Entrar como Admin"
                        emailPlaceholder="admin@exemplo.com"
                      />
                    </TabsContent>

                    <TabsContent value="register" className="mt-6">
                      <div className="space-y-4 text-center">
                        <p className="text-gray-600">Comece hoje mesmo a transformar sua incorporadora.</p>
                        <Button asChild className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black uppercase tracking-widest text-xs shadow-sem-lg shadow-primary/20">
                          <Link to="/register">CRIAR CONTA AGORA</Link>
                        </Button>

                      </div>
                    </TabsContent>

                    <TabsContent value="master" className="mt-6">

                      <LoginForm 
                        {...authForm} 
                        onSubmit={authForm.handleLogin}
                        forgotPasswordLink="/forgot-password"
                        submitButtonText="Acesso Master"
                        emailPlaceholder="master@a2incorporadora.com"
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
