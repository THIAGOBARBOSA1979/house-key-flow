
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  FileUp, 
  User, 
  CalendarClock, 
  ShieldCheck,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { 
      label: "Novo Atendimento", 
      icon: ShieldCheck, 
      onClick: () => navigate("/app/warranty"),
      color: "text-status-critical",
      bgColor: "bg-status-critical/10",
      description: "Abrir chamado de garantia"
    },
    { 
      label: "Novo Empreendimento", 
      icon: Building, 
      onClick: () => navigate("/app/properties"),
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      description: "Expandir o portfólio"
    },
    { 
      label: "Gestão de Clientes", 
      icon: User, 
      onClick: () => navigate("/app/ClientArea"),
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      description: "Painel de relacionamento"
    },
    { 
      label: "Enviar Documentos", 
      icon: FileUp, 
      onClick: () => navigate("/app/documents"),
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      description: "Sincronização de arquivos"
    },
  ];


  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black uppercase tracking-tighter">Ações Rápidas</h2>

      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-layout-gap">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto py-5 md:py-8 flex flex-col gap-4 md:gap-5 border border-border/20 bg-card/30 backdrop-blur-md shadow-sem-sm hover:shadow-sem-xl hover:bg-primary/5 hover:border-primary/20 transition-all group active:scale-[0.97] rounded-card"
            onClick={action.onClick}
          >
            <div className={`p-4 md:p-5 rounded-2xl ${action.bgColor} ${action.color} group-hover:scale-110 transition-all duration-500 shadow-sem-sm group-hover:shadow-sem-md border border-white/5`}>
              <action.icon size={24} className="md:w-7 md:h-7" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col gap-1 text-center">
              <span className="text-[11px] font-black text-foreground uppercase tracking-widest leading-none">{action.label}</span>
              <span className="text-[10px] text-muted-foreground font-bold leading-tight px-2 opacity-60">{action.description}</span>
            </div>
          </Button>
        ))}
      </div>

    </section>
  );
};
