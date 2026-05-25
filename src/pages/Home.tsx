
import { Link } from "react-router-dom";
import { 
  Building2, 
  Shield, 
  CheckCircle2, 
  Star,
  Users,
  Award,
  MapPin,
  Phone,
  Mail,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const benefits = [
    {
      icon: Building2,
      title: "Ecossistema de Gestão 360°",
      description: "Controle absoluto sobre seu portfólio com inteligência de dados e uma interface de alta performance."
    },
    {
      icon: CheckCircle2,
      title: "Vistorias Técnicas de Precisão",
      description: "Padronização total e relatórios dinâmicos que garantem a conformidade e agilidade na entrega."
    },
    {
      icon: Shield,
      title: "Pós-Venda e Garantias Premium",
      description: "Fortaleça o relacionamento com seu cliente através de um suporte técnico ágil, transparente e multicanal."
    }
  ];

  const stats = [
    { value: "98%", label: "Eficiência Operacional", icon: Star },
    { value: "5.2k+", label: "Unidades Gerenciadas", icon: Users },
    { value: "15+", label: "Anos de Liderança", icon: Award }
  ];


  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-background to-indigo-50/50 dark:from-background dark:to-background">
      {/* Header */}
      <header className="border-b border-border/5 bg-background/40 backdrop-blur-3xl sticky top-0 z-sticky transition-all duration-500">
        <div className="container-responsive py-5">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-indigo-600 flex items-center justify-center text-brand-foreground font-bold text-xl shadow-lg">
                A2
              </div>
              <div>
                <h1 className="text-h2 font-black tracking-tighter">A2 Incorporadora</h1>
                <p className="text-label text-brand font-black uppercase tracking-widest text-[10px]">Liderança em Construção</p>

              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 text-body-sm">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>(11) 9999-9999</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>contato@a2incorporadora.com</span>
                </div>
              </div>
              <Link to="/login">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6 rounded-xl font-bold transition-all shadow-sem-md shadow-primary/20 border-none">
                  Acessar Sistema
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-padding py-24 md:py-32">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20 px-4 py-1.5 font-bold uppercase tracking-wider text-[10px]">
              Plataforma de Alta Performance
            </Badge>
            
            <h2 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tighter">
              A inteligência definitiva para a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-indigo-600"> gestão da sua incorporadora</span>
            </h2>
            
            <p className="text-body-lg max-w-3xl mx-auto font-medium text-muted-foreground/80 leading-relaxed">
              Eleve o padrão da sua operação com vistorias técnicas automatizadas, 
              gestão de portfólio inteligente e um ecossistema focado em experiência do cliente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link to="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all border-none">
                  Criar Conta Grátis
                  <ArrowRight className="h-5 w-5 ml-2" strokeWidth={3} />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-[11px] border-2 border-border/40 hover:border-primary/20 hover:bg-primary/[0.02] transition-all">
                  Acessar Sistema
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-muted/[0.03] border-y border-border/5">
        <div className="container-responsive">
          <div className="grid-layout max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 rounded-[2rem] bg-brand/5 border border-brand/10 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-sem-md">
                  <stat.icon className="h-10 w-10 text-brand" strokeWidth={2.5} />
                </div>
                <div className="text-5xl font-black mb-2 tracking-tighter text-gradient">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{stat.label}</div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding py-24 md:py-32">
        <div className="container-responsive">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h3 className="text-4xl md:text-5xl mb-6 font-black tracking-tighter uppercase">
                Por que a A2 é o novo padrão?
              </h3>
              <p className="text-body-lg max-w-2xl mx-auto font-medium text-muted-foreground/70">
                Uma suíte de ferramentas projetada para entregar transparência, segurança jurídica e eficiência em cada etapa da jornada.
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="card-standard p-4-sem hover:shadow-sem-2xl hover:-translate-y-5 transition-all duration-700 rounded-[3.5rem] border border-border/10 bg-white/50 dark:bg-white/[0.02] group overflow-hidden">
                  <CardContent className="p-10 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary/10 to-primary/5 dark:to-white/[0.05] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-sem-sm">
                      <benefit.icon className="h-10 w-10 text-primary" strokeWidth={2.5} />
                    </div>
                    <h4 className="text-xl font-black tracking-tight mb-4 uppercase">{benefit.title}</h4>
                    <p className="text-sem-body-sm font-medium leading-relaxed opacity-70">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-gray-900 to-brand dark:from-black dark:to-brand/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="container-responsive py-24 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white space-y-10">
            <h3 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tighter">
              Pronto para escalar sua <br /> operação imobiliária?
            </h3>
            <p className="text-body-lg text-blue-100/70 max-w-2xl mx-auto font-medium">
              Domine seus processos, reduza gargalos operacionais e ofereça a melhor experiência de entrega aos seus clientes.
            </p>

            <Link to="/register">
              <Button size="lg" variant="secondary" className="h-18 px-16 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl bg-white text-black hover:bg-white/90 border-none hover:-translate-y-2 transition-all">
                Começar Teste Grátis
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-20 border-t border-white/5">
        <div className="container-responsive">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-xl">
                  A2
                </div>
                <span className="text-2xl font-black tracking-tighter">A2 Incorporadora</span>
              </div>
              <p className="text-gray-400 leading-relaxed font-medium">
                Construindo sonhos e entregando qualidade há mais de 15 anos no mercado imobiliário com tecnologia de ponta.
              </p>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Contato</h3>
              <div className="space-y-4 text-body-sm font-medium">
                <div className="flex items-center gap-3 group cursor-pointer">
                  <Phone className="h-4 w-4 text-brand" />
                  <span className="group-hover:text-white transition-colors">(11) 9999-9999</span>
                </div>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <Mail className="h-4 w-4 text-brand" />
                  <span className="group-hover:text-white transition-colors">contato@a2incorporadora.com</span>
                </div>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <MapPin className="h-4 w-4 text-brand" />
                  <span className="group-hover:text-white transition-colors">São Paulo, SP</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Ecossistema</h3>
              <div className="space-y-4 text-body-sm font-medium">
                <Link to="/privacy" className="block text-gray-400 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
                <Link to="/terms" className="block text-gray-400 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
                <Link to="/support" className="block text-gray-400 hover:text-white transition-colors">
                  Central de Ajuda
                </Link>
              </div>
            </div>
          </div>
          
          <Separator className="bg-white/10 mb-10" />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              © 2026 A2 Incorporadora. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                Service Status: Operational
               </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
