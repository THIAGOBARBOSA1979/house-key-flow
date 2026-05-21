
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const faqData = [
  {
    question: "Como agendo minha vistoria de chaves?",
    answer: "Assim que sua unidade estiver pronta, você receberá uma notificação e o botão 'Agendar Vistoria' será liberado no seu dashboard e na aba de vistorias."
  },
  {
    question: "Qual o prazo para atendimento de garantia?",
    answer: "O prazo varia conforme a urgência. Casos críticos (como vazamentos de gás) são atendidos em até 24h. Outros casos seguem o SLA técnico descrito no seu manual do proprietário."
  },
  {
    question: "Onde encontro a planta do meu imóvel?",
    answer: "Todas as plantas e manuais técnicos estão disponíveis na aba 'Documentos' do seu portal."
  },
  {
    question: "Como posso falar com o suporte técnico?",
    answer: "Você pode utilizar o botão 'Falar com suporte' no menu lateral ou abrir um chamado diretamente pela aba de 'Garantias'."
  }
];

export const ClientFAQ = () => {
  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Dúvidas Frequentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-sm font-bold text-left hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
