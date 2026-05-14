
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4-sem animate-fade-in">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Information */}
        <div className="hidden lg:flex flex-col space-y-8 pr-8 border-r border-border/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-brand text-brand-foreground flex items-center justify-center font-black text-2xl shadow-sem-lg border-2 border-white/20">
                A2
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">A2 Gestão</h1>
                <p className="text-sem-tiny font-black text-primary uppercase tracking-widest">Painel Administrativo v2.6</p>
              </div>
            </div>
            
            <h2 className="text-display font-black leading-none tracking-tight">
              Evolua a gestão do seu <span className="text-primary italic">negócio imobiliário</span>
            </h2>
            <p className="text-body-lg text-muted-foreground leading-relaxed max-w-md">
              Arquitetura de alta performance para controle de vistorias, documentos e relacionamento com clientes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="card-standard border-none bg-muted/10 p-5 group hover:bg-primary/5 transition-all">
                <feature.icon className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-label font-bold mb-1">{feature.title}</h3>
                <p className="text-sem-tiny text-muted-foreground leading-snug">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex justify-center w-full">
          <Card className="w-full max-w-md card-standard border-none bg-card/50 backdrop-blur-xl shadow-sem-xl overflow-hidden animate-slide-up">
            <div className="h-2 bg-brand" />
            <CardHeader className="space-y-4 p-8 pb-4">
              <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                 <div className="w-12 h-12 rounded-xl bg-brand text-brand-foreground flex items-center justify-center font-black text-xl shadow-sem-md">
                  A2
                </div>
              </div>
              <div className="text-center">
                <CardTitle className="text-h2 font-black tracking-tighter uppercase">Bem-vindo</CardTitle>
                <CardDescription className="text-sem-body-sm font-medium text-muted-foreground mt-2">
                  Acesse suas ferramentas de gestão administrativa.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sem-label font-bold text-foreground">Email Institucional</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  placeholder="admin@exemplo.com" 
                                  className="pl-11 h-12 rounded-xl bg-muted/20 border-border/10 focus:border-brand focus:ring-brand/20 transition-all font-medium" 
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
                            <FormLabel className="text-sem-label font-bold text-foreground">Senha de Acesso</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  type={showPassword ? "text" : "password"} 
                                  className="pl-11 pr-11 h-12 rounded-xl bg-muted/20 border-border/10 focus:border-brand focus:ring-brand/20 transition-all font-medium" 
                                  placeholder="••••••••"
                                  {...field} 
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent"
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

                      <div className="flex items-center justify-between text-sem-tiny">
                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 rounded border-border text-brand focus:ring-brand/20 cursor-pointer" 
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <span className="text-muted-foreground font-bold uppercase tracking-tight group-hover:text-foreground transition-colors">Lembrar acesso</span>
                        </label>
                        <Link to="/admin/forgot-password" virtual-link="true" className="text-primary font-black uppercase tracking-tight hover:underline">
                          Esqueci a senha
                        </Link>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-12 text-sm font-black uppercase tracking-widest bg-brand hover:bg-brand/90 transition-all duration-300 rounded-xl shadow-sem-md interactive-active" 
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

                  <div className="space-y-6 pt-4">
                    <Separator className="bg-border/10" />
                    
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <div className="text-center space-y-2">
                        <p className="text-sem-tiny font-black text-primary uppercase tracking-widest">
                          Acesso para Demonstração
                        </p>
                        <div className="font-mono text-[10px] text-muted-foreground bg-card p-3 rounded-lg border border-border/10 shadow-inner inline-block w-full">
                          <strong>LOGIN:</strong> admin@exemplo.com<br />
                          <strong>PASS:</strong> 123456
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Link to="/client/login" virtual-link="true" className="text-sem-tiny font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
                        Portal do Cliente <ArrowRight className="inline-block h-3 w-3 ml-1" />
                      </Link>
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
