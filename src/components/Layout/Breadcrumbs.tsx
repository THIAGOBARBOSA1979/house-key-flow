
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
  "client-area": "Área do Cliente",
  "settings": "Configurações",
  "client": "Portal do Cliente",
  "dashboard": "Dashboard"
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
      className={cn("flex items-center text-sm text-muted-foreground", className)}
    >
      <Link 
        to="/" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
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
