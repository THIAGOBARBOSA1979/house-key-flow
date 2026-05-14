
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
  BarChart3
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

const formSchema = z.object({
  email: z.string().email({
    message: "Digite um email válido",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres",
  }),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
        localStorage.setItem("rememberAdmin", "true");
      }
      
      await login(values.email, values.password, 'admin');
    } catch (error) {
      // Error handling is done in the AuthContext
      console.error("Login error:", error);
    }
  };

  const features = [
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                A2
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">A2 Incorporadora</h1>
                <p className="text-sm text-slate-600 font-medium">Área Administrativa</p>
              </div>
            </Link>
            <Link to="/client/login" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Portal do Cliente
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Information */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  Área Administrativa
                </div>
                <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                  Controle total do seu
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-blue-600"> negócio imobiliário</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Acesse o painel administrativo e gerencie todos os aspectos do seu empreendimento com eficiência e segurança.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security Notice */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-600 flex items-center justify-center text-white">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-2">Acesso Seguro</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Este é um ambiente restrito. Apenas administradores autorizados podem acessar esta área.
                      Todas as atividades são monitoradas e registradas para segurança.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Login form */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-4 pb-8">
                  <div className="text-center">
                    <CardTitle className="text-3xl font-bold text-gray-900">Acesso Administrativo</CardTitle>
                    <CardDescription className="mt-3 text-base text-gray-600">
                      Entre com suas credenciais de administrador
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
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
                                  {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
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
                        <Link to="/admin/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
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

                  <div className="space-y-4">
                    <Separator className="bg-gray-200" />
                    
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                      <div className="text-center">
                        <p className="text-amber-800 font-medium text-sm mb-2">
                          🔐 Credenciais para demonstração:
                        </p>
                        <div className="font-mono text-xs bg-white/80 p-3 rounded-lg border border-amber-200">
                          <div className="text-amber-700">
                            <strong>Email:</strong> admin@exemplo.com<br />
                            <strong>Senha:</strong> 123456
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
