
import { useState } from "react";
import { Link } from "react-router-dom";
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
  CheckCircle2, 
  Phone, 
  MapPin, 
  Clock,
  ArrowRight,
  Star,
  Users,
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
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  email: z.string().email({
    message: "Digite um email válido",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres",
  }),
});

export default function ClientLogin() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
        localStorage.setItem("rememberClient", "true");
      }
      
      await login(values.email, values.password, 'client');
    } catch (error) {
      // Error handling is done in the AuthContext
      console.error("Login error:", error);
    }
  };

  const benefits = [
    {
      icon: Building2,
      title: "Gestão Completa",
      description: "Visualize todos os detalhes do seu imóvel, documentos e histórico completo em um só lugar."
    },
    {
      icon: CheckCircle2,
      title: "Vistorias Digitais",
      description: "Agende vistorias online, acompanhe o progresso e receba relatórios detalhados instantaneamente."
    },
    {
      icon: Shield,
      title: "Garantias Ágeis",
      description: "Solicite atendimentos de garantia 24/7 e acompanhe cada etapa do processo em tempo real."
    }
  ];

  const stats = [
    { value: "98%", label: "Satisfação", icon: Star },
    { value: "2.5k+", label: "Clientes Ativos", icon: Users },
    { value: "15+", label: "Anos de Mercado", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-brand/10 dark:from-background dark:to-background">
      {/* Enhanced Header */}
      <header className="border-b bg-background/90 backdrop-blur-md sticky top-0 z-sticky">
        <div className="container-responsive py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-indigo-600 flex items-center justify-center text-brand-foreground font-bold text-xl shadow-lg">
                A2
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">A2 Incorporadora</h1>
                <p className="text-sm text-brand font-medium">Portal do Cliente</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>(11) 9999-9999</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Seg-Sex 8h-18h</span>
                </div>
              </div>
              <Link to="/admin/login" className="text-sm text-muted-foreground hover:text-brand transition-colors">
                Área Administrativa
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Enhanced Information */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Portal Exclusivo para Clientes
                </Badge>
                <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                  Sua casa, nosso
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> compromisso</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Acesse sua área exclusiva e tenha controle total sobre seu imóvel, vistorias e garantias de forma simples e intuitiva.
                </p>
              </div>

              {/* Stats */}
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

              {/* Benefits */}
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 transition-colors">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg">{benefit.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Help Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2">Primeira vez aqui?</h4>
                    <p className="text-blue-700 text-sm mb-4 leading-relaxed">
                      Suas credenciais de acesso foram enviadas por email após a compra do seu imóvel. 
                      Não encontra? Nossa equipe está pronta para ajudar!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-100">
                        <Phone className="h-4 w-4 mr-2" />
                        Falar com Suporte
                      </Button>
                      <Button variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-100">
                        <Mail className="h-4 w-4 mr-2" />
                        Reenviar Credenciais
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Enhanced Login form */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-4 pb-8">
                  <div className="text-center">
                    <CardTitle className="text-3xl font-bold text-gray-900">Bem-vindo de volta</CardTitle>
                    <CardDescription className="mt-3 text-base text-gray-600">
                      Digite suas credenciais para acessar seu portal exclusivo
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
                        <Link to="/client/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
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

                  <div className="space-y-4">
                    <Separator className="bg-gray-200" />
                    
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                      <div className="text-center">
                        <p className="text-amber-800 font-medium text-sm mb-2">
                          🔐 Credenciais para demonstração:
                        </p>
                        <div className="font-mono text-xs bg-white/80 p-3 rounded-lg border border-amber-200">
                          <div className="text-amber-700">
                            <strong>Email:</strong> cliente@exemplo.com<br />
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

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold">
                  A2
                </div>
                <span className="text-xl font-bold">A2 Incorporadora</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Construindo sonhos e entregando qualidade há mais de 15 anos no mercado imobiliário.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-lg">Contato</h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(11) 9999-9999</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>contato@a2incorporadora.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>São Paulo, SP</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-lg">Links Úteis</h3>
              <div className="space-y-2">
                <Link to="/privacy" className="block text-gray-300 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
                <Link to="/terms" className="block text-gray-300 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
                <Link to="/support" className="block text-gray-300 hover:text-white transition-colors">
                  Central de Ajuda
                </Link>
              </div>
            </div>
          </div>
          
          <Separator className="bg-white/20 mb-6" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 A2 Incorporadora. Todos os direitos reservados.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Desenvolvido com ❤️ para nossos clientes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
