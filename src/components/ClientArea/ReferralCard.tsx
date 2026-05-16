
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const ReferralCard = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const referralCode = "OBRA2024-MARIA";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: "Código copiado!",
      description: "Compartilhe seu código com seus amigos.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-xl overflow-hidden relative group">
      <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
        <Gift className="h-40 w-40" />
      </div>
      <CardHeader>
        <div className="p-2 bg-white/20 w-fit rounded-xl mb-2">
          <Gift className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-black tracking-tight">Indique e Ganhe</CardTitle>
        <CardDescription className="text-white/80">
          Indique um amigo e ganhe R$ 1.000,00 de desconto na sua próxima parcela após a assinatura do contrato dele.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Seu Código de Indicação</p>
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-lg font-bold tracking-wider">{referralCode}</span>
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-white text-indigo-600 hover:bg-white/90 font-bold"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <Button className="w-full bg-white text-indigo-600 hover:bg-white/90 font-black uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-indigo-900/20">
          Saiba Mais sobre o Programa
        </Button>
      </CardContent>
    </Card>
  );
};
