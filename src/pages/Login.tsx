import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthForm } from "@/hooks/identity/useAuthForm";
import { LoginForm } from "@/components/auth/LoginForm";

export default function Login() {
  const [activeTab, setActiveTab] = useState("client");
  const authForm = useAuthForm(activeTab);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-indigo-50/30 to-brand/5 dark:from-background dark:to-background overflow-x-hidden">
      <header className="border-b bg-background/90 backdrop-blur-md sticky top-0 z-sticky">
        <div className="container-responsive py-4">
          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-indigo-600 flex items-center justify-center text-brand-foreground font-bold text-xl shadow-lg">
                A2
              </div>
              <div>
                <h1 className="text-h2 font-black tracking-tighter text-foreground">A2 Incorporadora</h1>
                <p className="text-label text-brand uppercase tracking-widest">Sistema de Gestão</p>
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
                <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  {activeTab === "admin" ? "Área Administrativa" : "Portal do Cliente"}
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                  {activeTab === "admin" ? (
                    <>
                      Domine sua operação com
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-indigo-600"> inteligência estratégica</span>
                    </>
                  ) : (
                    <>
                      Experiência premium para o
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-indigo-600"> seu novo lar</span>
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
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                        <stat.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-6">
                {(activeTab === "admin" ? adminFeatures : clientBenefits).map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 transition-colors">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Card className="w-full max-w-md shadow-sem-xl border-border/10 bg-white/70 dark:bg-black/70 backdrop-blur-3xl mx-auto rounded-[2.5rem]">
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
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="client">Portal do Cliente</TabsTrigger>
                      <TabsTrigger value="admin">Área Administrativa</TabsTrigger>
                      <TabsTrigger value="master">SaaS Master</TabsTrigger>
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
