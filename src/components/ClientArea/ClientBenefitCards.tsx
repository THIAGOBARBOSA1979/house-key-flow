
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Users, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BenefitCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
}

const BenefitCard = ({ icon: Icon, title, description, actionLabel, variant = 'primary', className }: BenefitCardProps) => {
  const variants = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-muted text-foreground border-border",
    accent: "bg-emerald-500 text-white shadow-emerald-200"
  };

  return (
    <Card className={cn("overflow-hidden border-none shadow-lg transition-all duration-500 hover:scale-[1.02] group rounded-3xl", variants[variant], className)}>
      <CardContent className="p-6 h-full flex flex-col justify-between">
        <div>
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-700 group-hover:rotate-12", 
            variant === 'primary' ? "bg-white/20" : 
            variant === 'accent' ? "bg-white/20" : "bg-primary/10 text-primary")}>
            <Icon size={24} />
          </div>
          <h3 className="text-lg font-black tracking-tight mb-2 leading-tight">{title}</h3>
          <p className={cn("text-xs leading-relaxed mb-6", 
            variant === 'secondary' ? "text-muted-foreground font-medium" : "text-white/80 font-medium")}>
            {description}
          </p>
        </div>
        <Button 
          variant={variant === 'secondary' ? "default" : "secondary"} 
          className="w-full rounded-xl font-black uppercase tracking-widest text-[9px] h-10 shadow-sm"
        >
          {actionLabel}
          <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
};

export const ClientBenefitCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <BenefitCard 
        icon={Users}
        title="Indique e Ganhe"
        description="Indique um amigo para a A2 e ganhe bônus exclusivos no seu condomínio ou descontos em parcelas."
        actionLabel="Quero Indicar"
        variant="primary"
      />
      <BenefitCard 
        icon={Gift}
        title="Clube de Vantagens"
        description="Acesse descontos exclusivos em lojas de móveis, decoração e acabamentos parceiras da A2."
        actionLabel="Ver Parceiros"
        variant="secondary"
      />
      <BenefitCard 
        icon={Star}
        title="Upgrade VIP"
        description="Clientes A2 possuem prioridade em lançamentos e condições especiais para o segundo imóvel."
        actionLabel="Saber Mais"
        variant="accent"
      />
    </div>
  );
};
