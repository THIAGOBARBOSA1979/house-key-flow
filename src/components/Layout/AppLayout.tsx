
import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Determine left margin based on sidebar state
  const marginLeft = isMobile ? 0 : (sidebarCollapsed ? 64 : 256);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div 
        className="min-h-screen transition-all duration-300"
        style={{ marginLeft: isMobile ? 0 : undefined }}
      >
        {/* Top bar with breadcrumbs and user info */}
        <div className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center justify-between p-4 lg:ml-64">
            <div className="flex items-center gap-4">
              {isMobile && <div className="w-10" />} {/* Spacer for mobile menu button */}
              <Breadcrumbs />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <main className="p-4 md:p-6 lg:p-8 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};
