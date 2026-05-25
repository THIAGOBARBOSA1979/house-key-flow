
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-background to-indigo-50/50 dark:from-background dark:to-background">
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
                <p className="text-label text-brand font-black uppercase tracking-widest">Liderança em Construção</p>

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
                <Button className="bg-gradient-to-r from-brand to-indigo-600 hover:from-brand/90 hover:to-indigo-700 text-brand-foreground">
                  Acessar Sistema
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <Badge variant="outline" className="bg-brand/10 text-brand border-brand/20 px-4 py-1.5 font-bold uppercase tracking-wider">
              Plataforma de Alta Performance
            </Badge>
            
            <h2 className="text-display leading-tight">
              A inteligência definitiva para a 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-indigo-600"> gestão da sua incorporadora</span>
            </h2>
            
            <p className="text-body-lg max-w-3xl mx-auto font-medium text-muted-foreground/80">
              Eleve o padrão da sua operação com vistorias técnicas automatizadas, 
              gestão de portfólio inteligente e um ecossistema focado em experiência do cliente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all">
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
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-brand" />
                </div>
                <div className="text-display mb-2">{stat.value}</div>
                <div className="text-body-base text-muted-foreground font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding">
        <div className="container-responsive">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-h1 mb-4 font-black">
                Por que a A2 é o novo padrão do mercado?
              </h3>
              <p className="text-body-lg max-w-2xl mx-auto font-medium text-muted-foreground/70">
                Uma suíte de ferramentas projetada para entregar transparência, segurança jurídica e eficiência em cada etapa da jornada.
              </p>

            </div>

            <div className="grid-layout">
              {benefits.map((benefit, index) => (
                <Card key={index} className="card-standard p-3-sem hover:shadow-sem-xl hover:-translate-y-2 transition-all duration-500 rounded-[2.5rem]">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand/10 to-indigo-100 dark:to-indigo-900/20 flex items-center justify-center mx-auto mb-6">
                      <benefit.icon className="h-8 w-8 text-brand" />
                    </div>
                    <h4 className="text-h4 mb-4">{benefit.title}</h4>
                    <p className="text-body-base">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-gray-900 to-brand dark:from-black dark:to-brand/20">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center text-white space-y-8">
            <h3 className="text-display font-black leading-tight">
              Pronto para escalar sua operação imobiliária?
            </h3>
            <p className="text-body-lg text-blue-100/70 max-w-2xl mx-auto font-medium">
              Domine seus processos, reduza gargalos operacionais e ofereça a melhor experiência de entrega aos seus clientes.
            </p>

            <Link to="/register">
              <Button size="lg" variant="secondary" className="h-16 px-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl bg-white text-black hover:bg-white/90">
                Começar Teste Grátis
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="container-responsive">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold">
                  A2
                </div>
                <span className="text-xl font-bold">A2 Incorporadora</span>
              </div>
              <p className="text-gray-300 dark:text-gray-400 leading-relaxed">
                Construindo sonhos e entregando qualidade há mais de 15 anos no mercado imobiliário.
              </p>
            </div>
            
            <div>
              <h3 className="text-label text-white mb-4">Contato</h3>
              <div className="space-y-3 text-body-sm">
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
              <h3 className="text-label text-white mb-4">Links Úteis</h3>
              <div className="space-y-2 text-body-sm">
                <Link to="/privacy" className="block text-gray-300 dark:text-gray-400 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
                <Link to="/terms" className="block text-gray-300 dark:text-gray-400 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
                <Link to="/support" className="block text-gray-300 dark:text-gray-400 hover:text-white transition-colors">
                  Central de Ajuda
                </Link>
              </div>
            </div>
          </div>
          
          <Separator className="bg-white/20 mb-6" />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
