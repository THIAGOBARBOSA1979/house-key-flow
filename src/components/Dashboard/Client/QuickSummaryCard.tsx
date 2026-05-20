import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  FileText, 
  ClipboardCheck, 
  ShieldCheck, 
  DollarSign,
  Bell
} from "lucide-react";

interface QuickSummaryCardProps {
  allDocsCount: number;
  completedInspectionsCount: number;
  activeWarrantiesCount: number;
  financialProgress: number;
  unreadNotificationsCount: number;
}

export const QuickSummaryCard = ({
  allDocsCount,
  completedInspectionsCount,
  activeWarrantiesCount,
  financialProgress,
  unreadNotificationsCount
}: QuickSummaryCardProps) => (
  <Card className="bg-primary text-primary-foreground shadow-lg flex flex-col justify-between border-none overflow-hidden relative group rounded-3xl">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    <CardHeader>
      <CardTitle className="text-lg font-bold">Resumo Geral</CardTitle>
      <CardDescription className="text-primary-foreground/70">Status dos seus serviços ativos</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/15 transition-colors">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-white/70" />
          <span className="text-sm font-medium">Documentos</span>
        </div>
        <span className="font-black">{allDocsCount}</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/15 transition-colors">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-white/70" />
          <span className="text-sm font-medium">Vistorias</span>
        </div>
        <span className="font-black">{completedInspectionsCount}</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/15 transition-colors">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-white/70" />
          <span className="text-sm font-medium">Garantias</span>
        </div>
        <span className="font-black">{activeWarrantiesCount}</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/15 transition-colors">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-white/70" />
          <span className="text-sm font-medium">Financeiro</span>
        </div>
        <span className="font-black">{Math.round(financialProgress)}%</span>
      </div>
    </CardContent>
    <CardFooter className="pt-0 pb-6">
      <Link to="/client/notifications" className="w-full">
        <Button variant="secondary" className="w-full font-black uppercase tracking-widest text-[10px] h-11 shadow-md rounded-xl">
          <Bell className="mr-2 h-4 w-4" />
          Notificações ({unreadNotificationsCount})
        </Button>
      </Link>
    </CardFooter>
  </Card>
);
