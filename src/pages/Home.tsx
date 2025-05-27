
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
      title: "Gestão Completa de Imóveis",
      description: "Controle total sobre seu portfólio imobiliário com tecnologia avançada e interface intuitiva."
    },
    {
      icon: CheckCircle2,
      title: "Vistorias Digitais Inteligentes",
      description: "Sistema automatizado de vistorias com relatórios detalhados e acompanhamento em tempo real."
    },
    {
      icon: Shield,
      title: "Garantias e Suporte 24/7",
      description: "Atendimento especializado para garantias com processo ágil e transparente."
    }
  ];

  const stats = [
    { value: "98%", label: "Satisfação do Cliente", icon: Star },
    { value: "2.5k+", label: "Clientes Ativos", icon: Users },
    { value: "15+", label: "Anos de Experiência", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                A2
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">A2 Incorporadora</h1>
                <p className="text-sm text-blue-600 font-medium">Excelência em Construção</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
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
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Acessar Sistema
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-lg px-6 py-2">
              Sistema de Gestão Imobiliária
            </Badge>
            
            <h2 className="text-6xl font-bold text-gray-900 leading-tight">
              A tecnologia que sua
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> incorporadora precisa</span>
            </h2>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Plataforma completa para gestão de imóveis, vistorias digitais e atendimento ao cliente. 
              Simplifique seus processos e ofereça uma experiência excepcional.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4">
                  Entrar no Sistema
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                Solicitar Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                Por que escolher a A2 Incorporadora?
              </h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Nossa plataforma oferece todas as ferramentas necessárias para uma gestão eficiente e transparente.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
                      <benefit.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">{benefit.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white space-y-8">
            <h3 className="text-4xl font-bold">
              Pronto para revolucionar sua gestão imobiliária?
            </h3>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Junte-se a milhares de clientes satisfeitos e experimente a diferença de um sistema completo e intuitivo.
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Começar Agora
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
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
