
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2, 
  Shield, 
  ArrowRight,
  Users,
  Settings,
  BarChart3,
  CheckCircle2,
  Star,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  email: z.string().email({
    message: "Digite um email válido",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres",
  }),
});

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeTab, setActiveTab] = useState("client");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem(activeTab === "admin" ? "rememberAdmin" : "rememberClient", "true");
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("rememberAdmin");
        localStorage.removeItem("rememberClient");
      }

      
      await login(values.email, values.password, activeTab as 'admin' | 'client');
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const adminFeatures = [
    {
      icon: Users,
      title: "Gestão de Usuários",
      description: "Controle completo de clientes e equipe"
    },
    {
      icon: Building2,
      title: "Gestão de Imóveis", 
      description: "Administre todo o portfólio de imóveis"
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Insights e métricas detalhadas"
    },
    {
      icon: Settings,
      title: "Configurações",
      description: "Personalize o sistema conforme sua necessidade"
    }
  ];

  const clientBenefits = [
    {
      icon: Building2,
      title: "Gestão Completa",
      description: "Visualize todos os detalhes do seu imóvel e documentos."
    },
    {
      icon: CheckCircle2,
      title: "Vistorias Digitais",
      description: "Agende vistorias online e receba relatórios detalhados."
    },
    {
      icon: Shield,
      title: "Garantias Ágeis",
      description: "Solicite atendimentos de garantia 24/7."
    }
  ];

  const stats = [
    { value: "98%", label: "Satisfação", icon: Star },
    { value: "2.5k+", label: "Clientes Ativos", icon: Users },
    { value: "15+", label: "Anos de Mercado", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-brand/10 dark:from-background dark:to-background overflow-x-hidden">
      {/* Header */}
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
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Dynamic Information */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  {activeTab === "admin" ? "Área Administrativa" : "Portal do Cliente"}
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  {activeTab === "admin" ? (
                    <>
                      Controle total do seu
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-blue-600"> negócio imobiliário</span>
                    </>
                  ) : (
                    <>
                      Sua casa, nosso
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> compromisso</span>
                    </>
                  )}
                </h2>
                <p className="text-body-lg text-muted-foreground leading-relaxed">
                  {activeTab === "admin" 
                    ? "Acesse o painel administrativo e gerencie todos os aspectos do seu empreendimento com eficiência e segurança."
                    : "Acesse sua área exclusiva e tenha controle total sobre seu imóvel, vistorias e garantias de forma simples e intuitiva."
                  }
                </p>
              </div>

              {/* Stats for client */}
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

              {/* Features/Benefits */}
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

            {/* Right side - Login form */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm mx-auto">
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
                  {/* Tabs for switching between admin and client */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="client">Portal do Cliente</TabsTrigger>
                      <TabsTrigger value="admin">Área Administrativa</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="client" className="mt-6">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-medium">Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <Input 
                                      placeholder="seu@email.com" 
                                      className="pl-11 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-medium">Senha</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <Input 
                                      type={showPassword ? "text" : "password"} 
                                      className="pl-11 pr-11 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500" 
                                      placeholder="••••••••"
                                      {...field} 
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-1 top-1 h-10 w-10 text-gray-400 hover:text-gray-600"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                              />
                              <span className="text-gray-700 font-medium">Lembrar de mim</span>
                            </label>
                            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                              Esqueci minha senha
                            </Link>
                          </div>

                          <Button 
                            type="submit" 
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200" 
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Entrando...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                Entrar no Portal
                                <ArrowRight className="h-4 w-4" />
                              </div>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>

                    <TabsContent value="admin" className="mt-6">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-medium">Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <Input 
                                      placeholder="admin@exemplo.com" 
                                      className="pl-11 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500" 
                                      {...field} 
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-medium">Senha</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <Input 
                                      type={showPassword ? "text" : "password"} 
                                      className="pl-11 pr-11 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500" 
                                      placeholder="••••••••"
                                      {...field} 
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-1 top-1 h-10 w-10 text-gray-400 hover:text-gray-600"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                              />
                              <span className="text-gray-700 font-medium">Lembrar de mim</span>
                            </label>
                            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                              Esqueci minha senha
                            </Link>
                          </div>

                          <Button 
                            type="submit" 
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700 transition-all duration-200" 
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Entrando...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                Acessar Painel
                                <ArrowRight className="h-4 w-4" />
                              </div>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>

                  <div className="space-y-4">
                    <Separator className="bg-gray-200" />
                    
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                      <div className="text-center">
                        <p className="text-amber-800 font-medium text-sm mb-2">
                          🔐 Credenciais para demonstração:
                        </p>
                        <div className="font-mono text-xs bg-white/80 p-3 rounded-lg border border-amber-200">
                          <div className="text-amber-700">
                            {activeTab === "admin" ? (
                              <>
                                <strong>Email:</strong> admin@exemplo.com<br />
                                <strong>Senha:</strong> 123456
                              </>
                            ) : (
                              <>
                                <strong>Email:</strong> cliente@exemplo.com<br />
                                <strong>Senha:</strong> 123456
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
