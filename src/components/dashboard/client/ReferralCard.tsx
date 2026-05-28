import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Check, Share2 } from "lucide-react";
import { useToast } from "@/hooks";

export const ReferralCard = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const referralLink = `${window.location.origin}/register?ref=${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Link Copiado!",
      description: "Compartilhe seu link de indicação e ganhe bônus exclusivos.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-2xl rounded-[2.5rem] overflow-hidden relative group border-none min-h-[300px] flex flex-col justify-between">
      <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-slow" />
      <CardHeader className="p-8 sm:p-10 pb-4 relative z-10">
         <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-6 shadow-xl border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
           <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-white" strokeWidth={2.5} />
         </div>
         <CardTitle className="text-2xl sm:text-3xl font-black leading-none tracking-tighter mb-2">Indicação Premiada</CardTitle>
         <CardDescription className="text-emerald-50/80 font-bold text-sm leading-relaxed">
           Indique novos proprietários para a família A2 e receba benefícios exclusivos na sua próxima taxa condominial.
         </CardDescription>
      </CardHeader>
      <CardContent className="p-8 sm:p-10 pt-0 relative z-10 mt-auto">
        <Button 
          onClick={handleShare}
          className="w-full bg-white text-emerald-700 hover:bg-emerald-50 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-[11px] h-14 shadow-2xl shadow-emerald-900/20 group-hover:translate-y-[-2px] transition-transform"
        >
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
          {copied ? "Link Copiado" : "Gerar Link de Indicação"}
        </Button>
      </CardContent>
    </Card>
  );
};