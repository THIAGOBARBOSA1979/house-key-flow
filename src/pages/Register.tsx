import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building2, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { Supabase } from "@/integrations/supabase";
import { companyService } from "@/services";


const registerSchema = z.object({
  companyName: z.string().min(3, "Nome da empresa deve ter pelo menos 3 caracteres"),
  fullName: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  email: z.string().email("Digite um email válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      companyName: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    setIsLoading(true);
    try {
      const slug = values.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // 1. Criar empresa usando Supabase direto ou Service
      const { data: company, error: companyError } = await Supabase.db.create<any>(
        'companies',
        {
          name: values.companyName,
          slug: slug,
          status: 'active' as any
        }
      );

      if (companyError) throw companyError;

      // 2. Criar usuário no Auth (com metadados)
      const { data: authData, error: authError } = await Supabase.auth.signUp(
        values.email,
        values.password,
        {
          data: {
            full_name: values.fullName,
            role: 'admin',
            company_id: (company as any).id
          }
        }
      );



      if (authError) throw authError;

      // 3. Atualizar owner da empresa
      if (authData?.user) {
        await Supabase.db.update(
          'companies',
          (company as any).id,
          { owner_id: authData.user.id }
        );
      }



      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode começar a usar o sistema.",
      });

      navigate('/app');
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-brand/5 dark:from-background dark:to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-sem-lg border-border/40 bg-white/60 dark:bg-black/60 backdrop-blur-2xl rounded-card overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <CardHeader className="text-center space-y-4 pt-10 pb-8">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/20">
              A2
            </div>
          </div>
          <CardTitle className="text-3xl md:text-4xl font-black tracking-tighter">Começar Teste Grátis</CardTitle>
          <CardDescription className="text-base font-medium">Crie seu ecossistema de gestão em menos de 1 minuto</CardDescription>
        </CardHeader>

        <CardContent className="px-8 md:px-12 pb-12">
          <Form {...form}>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Incorporadora</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input placeholder="A2 Incorporadora" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu Nome Completo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input placeholder="João Silva" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Corporativo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input placeholder="joao@suaempresa.com" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full h-14 text-sm font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-2xl mt-4" disabled={isLoading}>
                {isLoading ? "Provisionando Ambiente..." : (
                  <div className="flex items-center gap-2">
                    Criar Meu Acesso Estratégico
                    <ArrowRight className="h-4 w-4" strokeWidth={3} />
                  </div>
                )}
              </Button>
              <p className="text-center text-xs font-bold text-muted-foreground mt-6 uppercase tracking-widest">
                Já possui uma licença ativa?{" "}
                <Link to="/login" className="text-primary font-black hover:underline underline-offset-4">
                  Fazer Login
                </Link>
              </p>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
