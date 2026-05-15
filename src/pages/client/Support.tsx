
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  FileQuestion, 
  HelpCircle, 
  ArrowRight,
  ChevronRight,
  LifeBuoy,
  BookOpen,
  Send,
  ExternalLink
} from "lucide-react";
import { ClientFAQ } from "@/components/ClientFlow/ClientFAQ";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Support = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Solicitação enviada",
      description: "Sua mensagem foi enviada para nossa equipe de suporte. Responderemos em breve.",
    });
    setFormState({ subject: "", message: "" });
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Telefone",
      detail: "(11) 4003-0000",
      description: "Segunda a Sexta, 08h às 18h",
      action: "Ligar agora",
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      icon: Mail,
      title: "E-mail",
      detail: "suporte@a2incorporadora.com.br",
      description: "Resposta em até 24h úteis",
      action: "Enviar e-mail",
      color: "text-purple-500",
      bg: "bg-purple-50"
    },
    {
      icon: MessageSquare,
      title: "WhatsApp",
      detail: "(11) 99999-0000",
      description: "Atendimento instantâneo",
      action: "Iniciar conversa",
      color: "text-green-500",
      bg: "bg-green-50"
    }
  ];

  return (
    <div className="space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-slow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LifeBuoy className="h-8 w-8 text-primary" />
            Central de Ajuda e Suporte
          </h1>
          <p className="text-muted-foreground mt-1">
            Estamos aqui para ajudar você com qualquer dúvida ou solicitação.
          </p>
        </div>
      </div>

      {/* Hero Section / Knowledge Base Search */}
      <Card className="bg-primary text-primary-foreground overflow-hidden relative border-none shadow-xl">
        <div className="absolute right-[-5%] top-[-10%] opacity-10">
          <BookOpen size={200} />
        </div>
        <CardContent className="p-8 md:p-12 relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-4">Como podemos ajudar hoje?</h2>
          <div className="w-full relative group">
            <Input 
              className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-2xl pl-12 pr-4 text-lg focus:bg-white focus:text-foreground transition-all duration-300"
              placeholder="Pesquisar em nossa base de conhecimento..."
            />
            <FileQuestion className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-primary h-5 w-5 transition-colors" />
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['Vistorias', 'Garantias', 'Financeiro', 'Documentos', 'Prazo de Entrega'].map(tag => (
              <span key={tag} className="text-xs font-bold px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-layout-gap">
        {contactMethods.map((method, idx) => {
          const Icon = method.icon;
          return (
            <Card key={idx} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-6 text-center space-y-4">
                <div className={`mx-auto w-12 h-12 ${method.bg} ${method.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{method.title}</h3>
                  <p className="text-sm font-black text-primary mt-1">{method.detail}</p>
                  <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                </div>
                <Button variant="outline" className="w-full rounded-xl text-xs font-bold uppercase tracking-widest">
                  {method.action}
                  <ChevronRight size={14} className="ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-layout-gap">
        {/* Support Ticket Form */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Abrir um Chamado
            </CardTitle>
            <CardDescription>
              Caso não tenha encontrado o que precisa, envie-nos uma mensagem detalhada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Assunto</label>
                <Input 
                  value={formState.subject}
                  onChange={e => setFormState(prev => ({...prev, subject: e.target.value}))}
                  placeholder="Ex: Dúvida sobre parcelas de maio" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Mensagem</label>
                <Textarea 
                  value={formState.message}
                  onChange={e => setFormState(prev => ({...prev, message: e.target.value}))}
                  placeholder="Descreva sua solicitação com o máximo de detalhes possível..." 
                  className="min-h-[120px]"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 font-black uppercase tracking-widest text-xs">
                Enviar Solicitação
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Links / Resources */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Manuais e Guias
              </CardTitle>
              <CardDescription>Documentos úteis para download imediato</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {[
                  { title: "Manual do Proprietário", size: "4.2 MB", type: "PDF" },
                  { title: "Guia Rápido de Manutenção", size: "1.5 MB", type: "PDF" },
                  { title: "Termo de Garantia Geral", size: "0.8 MB", type: "PDF" },
                  { title: "Manual do Condômino", size: "3.1 MB", type: "PDF" }
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <FileQuestion className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{doc.title}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/30 border-none">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                Dica do dia
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Você pode acompanhar o status de todas as suas solicitações de garantia diretamente na aba "Garantias". Cada atualização gera uma notificação em tempo real para o seu e-mail cadastrado.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Integration */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileQuestion className="h-6 w-6 text-primary" />
          Perguntas Frequentes
        </h2>
        <ClientFAQ />
      </div>
    </div>
  );
};

export default Support;
