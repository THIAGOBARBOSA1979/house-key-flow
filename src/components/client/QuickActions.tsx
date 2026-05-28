
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MessageSquare, 
  ShieldCheck, 
  CreditCard, 
  FileText,
  Smartphone
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Abrir Protocolo",
      icon: MessageSquare,
      color: "bg-blue-500",
      path: "/client/support",
      description: "Suporte técnico"
    },
    {
      title: "Solicitar Garantia",
      icon: ShieldCheck,
      color: "bg-indigo-600",
      path: "/client/warranty",
      description: "Assistência técnica"
    },
    {
      title: "Segunda Via Boleto",
      icon: CreditCard,
      color: "bg-amber-500",
      path: "/client/financial",
      description: "Financeiro"
    },
    {
      title: "Dossiê Técnico",
      icon: FileText,
      color: "bg-emerald-500",
      path: "/client/properties",
      description: "Plantas e manuais"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={() => navigate(action.path)}
          className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-white border border-border/5 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all group text-center"
        >
          <div className={`p-4 ${action.color} text-white rounded-2xl shadow-lg shadow-opacity-20 group-hover:scale-110 transition-transform`}>
            <action.icon size={20} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-widest text-foreground">{action.title}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{action.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};
