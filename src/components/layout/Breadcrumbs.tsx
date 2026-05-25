
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Route label mapping
const routeLabels: Record<string, string> = {
  "admin": "Painel",
  "properties": "Empreendimentos",
  "inspections": "Vistorias",
  "warranty": "Garantias",
  "documents": "Documentos",
  "checklist": "Checklists",
  "calendar": "Agendamentos",
  "users": "Usuários",
  "ClientArea": "Área do Cliente",
  "settings": "Configurações",
  "client": "Portal do Cliente",
  "dashboard": "Dashboard",
  "support": "Suporte",
  "financial": "Financeiro",
  "announcements": "Comunicados",
  "technicians": "Técnicos",
  "design-system": "Design System",
  "audit-logs": "Auditoria"
};

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (pathSegments.length <= 1) return null;

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = routeLabels[segment] || segment;
    const isLast = index === pathSegments.length - 1;

    return { path, label, isLast };
  });

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 overflow-x-auto no-scrollbar whitespace-nowrap pb-2", className)}
    >
      <Link 
        to="/" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center">
          <ChevronRight className="h-3 w-3 mx-2 opacity-30" />
          {crumb.isLast ? (
            <span className="font-black text-primary transition-all scale-105">{crumb.label}</span>
          ) : (
            <Link 
              to={crumb.path}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
