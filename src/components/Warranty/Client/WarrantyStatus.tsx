import { Clock, MessageSquare, ShieldCheck, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

import { 
  WarrantyStage, 
  WARRANTY_STAGES 
} from "@/types/warrantyFlow";

interface WarrantyStatusProps {
  status: WarrantyStage;
}

export const WarrantyStatus = ({ status }: WarrantyStatusProps) => {
  const statusConfig = {
    opened: {
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      text: "Protocolo Aberto",
      description: "Sua solicitação foi registrada e está em fila de processamento."
    },
    in_analysis: {
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50/50",
      border: "border-amber-100",
      text: "Em Análise Técnica",
      description: "Nossa engenharia está avaliando os detalhes e evidências fornecidas."
    },
    inspection_scheduled: {
      icon: Clock,
      color: "text-purple-500",
      bg: "bg-purple-50/50",
      border: "border-purple-100",
      text: "Vistoria Agendada",
      description: "Um especialista visitará sua unidade na data acordada."
    },
    inspection_completed: {
      icon: MessageSquare,
      color: "text-indigo-500",
      bg: "bg-indigo-50/50",
      border: "border-indigo-100",
      text: "Vistoria Realizada",
      description: "Laudo técnico em fase de elaboração e orçamento."
    },
    approved: {
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-50/50",
      border: "border-emerald-100",
      text: "Aprovado para Reparo",
      description: "Sua solicitação foi validada tecnicamente e seguirá para execução."
    },
    in_execution: {
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50/80",
      border: "border-blue-200",
      text: "Reparo em Andamento",
      description: "Equipe técnica em campo realizando as intervenções necessárias."
    },
    completed: {
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-100/50",
      border: "border-emerald-200",
      text: "Protocolo Concluído",
      description: "O atendimento foi finalizado e homologado."
    },
    rejected: {
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50/50",
      border: "border-red-100",
      text: "Encerrado / Não Procedente",
      description: "Este protocolo foi finalizado sem intervenção técnica adicional."
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`p-5 ${config.bg} border-2 ${config.border} rounded-2xl shadow-sm animate-in slide-in-from-top-2 duration-500`}>
      <div className="flex gap-4 items-center">
        <div className={cn("p-3 rounded-xl bg-white shadow-sm", config.color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-black text-base tracking-tight">{config.text}</h3>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">{config.description}</p>
        </div>
      </div>
    </div>
  );
};
