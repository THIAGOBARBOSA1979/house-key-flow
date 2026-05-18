
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
      label: "Nova Obra", 
      icon: Building, 
      onClick: () => navigate("/admin/properties"),
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      description: "Cadastrar empreendimento"
    },
    { 
      label: "Novo Chamado", 
      icon: ShieldCheck, 
      onClick: () => navigate("/admin/warranty"),
      color: "text-status-critical",
      bgColor: "bg-status-critical/10",
      description: "Solicitação de assistência"
    },
    { 
      label: "Área do Cliente", 
      icon: User, 
      onClick: () => navigate("/admin/client-area"),
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      description: "Ver portal do cliente"
    },
    { 
      label: "Upload Documento", 
      icon: FileUp, 
      onClick: () => navigate("/admin/documents"),
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      description: "Enviar para cliente"
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h2">Ações Rápidas</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto py-6 flex flex-col gap-4 border-none bg-card/40 backdrop-blur-md shadow-sem-md hover:shadow-sem-xl hover:bg-primary/5 transition-all group active:scale-[0.97] rounded-2xl"
            onClick={action.onClick}
          >
            <div className={`p-4 rounded-xl ${action.bgColor} ${action.color} group-hover:scale-110 transition-all duration-300 shadow-sem-sm group-hover:shadow-sem-md`}>
              <action.icon size={28} strokeWidth={2.5} />
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
