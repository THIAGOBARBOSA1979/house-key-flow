
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
    answer: "Todas as plantas e manuais técnicos estão disponíveis na aba 'Documentos' do seu portal ou no dossiê técnico na aba 'Meu Imóvel'."
  },
  {
    question: "Como faço para trocar o titular da unidade?",
    answer: "A troca de titularidade exige documentação legal. Entre em contato com o suporte financeiro anexando o contrato de cessão ou escritura."
  },
  {
    question: "Quais reparos estão cobertos pela garantia?",
    answer: "A garantia cobre defeitos de execução e materiais conforme a tabela da NBR 15575. Itens de desgaste natural (como lâmpadas ou vedantes) são de responsabilidade do proprietário."
  },
  {
    question: "Posso realizar reformas antes da entrega das chaves?",
    answer: "Não. Por questões de segurança e seguro da obra, nenhuma reforma ou personalização pode ser feita antes da vistoria final e entrega oficial das chaves."
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
