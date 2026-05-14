
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  FileUp, 
  UserPlus, 
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
      label: "Novo Empreendimento", 
      icon: Building, 
      onClick: () => navigate("/admin/properties"),
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    { 
      label: "Upload Documento", 
      icon: FileUp, 
      onClick: () => navigate("/admin/documents"),
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    { 
      label: "Cadastrar Usuário", 
      icon: UserPlus, 
      onClick: () => navigate("/admin/users"),
      color: "text-emerald-500",
      bgColor: "bg-emerald-50"
    },
    { 
      label: "Agendar Vistoria", 
      icon: CalendarClock, 
      onClick: () => navigate("/admin/inspections"),
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h2">Ações Rápidas</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto py-6 flex flex-col gap-3 border-none bg-card/50 backdrop-blur-sm shadow-sem-sm hover:shadow-sem-md hover:bg-primary/5 transition-all group active:scale-95"
            onClick={action.onClick}
          >
            <div className={`p-3 rounded-xl ${action.bgColor} ${action.color} group-hover:scale-110 transition-transform`}>
              <action.icon size={24} />
            </div>
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">{action.label}</span>
          </Button>
        ))}
      </div>
    </section>
  );
};
