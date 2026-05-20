import { Clock, MessageSquare, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusType = "pending" | "progress" | "complete" | "critical";

interface WarrantyStatusProps {
  status: StatusType;
}

export const WarrantyStatus = ({ status }: WarrantyStatusProps) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-status-pending",
      bg: "bg-status-pending/10",
      border: "border-status-pending/20",
      text: "Aguardando Análise",
      description: "Sua solicitação foi registrada e está aguardando análise da equipe técnica."
    },
    progress: {
      icon: MessageSquare,
      color: "text-status-progress",
      bg: "bg-status-progress/10",
      border: "border-status-progress/20",
      text: "Em Atendimento",
      description: "Um técnico foi designado e está trabalhando na sua solicitação."
    },
    complete: {
      icon: ShieldCheck,
      color: "text-status-complete",
      bg: "bg-status-complete/10",
      border: "border-status-complete/20",
      text: "Finalizado",
      description: "O atendimento foi concluído com sucesso."
    },
    critical: {
      icon: AlertTriangle,
      color: "text-status-critical",
      bg: "bg-status-critical/10",
      border: "border-status-critical/20",
      text: "Crítico",
      description: "Sua solicitação foi classificada como crítica e está sendo tratada com prioridade."
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
