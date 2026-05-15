
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  FileText, 
  ClipboardCheck, 
  ShieldCheck, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Bell,
  ArrowRight,
  Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ClientTimeline } from "@/components/ClientFlow/ClientTimeline";
import { StageIndicator } from "@/components/ClientFlow/StageIndicator";
import { FeatureGate, GatedButton } from "@/components/ClientFlow/FeatureGate";
import { useClientStage } from "@/hooks/useClientStage";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  // Get client stage data
  const { user } = useAuth();
  const clientId = user?.id || "client-1"; // Get from auth context
  const { 
    profile, 
    stage, 
    permissions, 
    timeline, 
    isLoading,
    canScheduleInspection,
    canRequestWarranty 
  } = useClientStage(clientId);
  
  const { unreadCount, urgentNotifications } = useNotifications(clientId);

  // Get user info from profile
  const userInfo = {
    name: user?.name || profile?.name || "Maria Oliveira",
    property: profile?.propertyName || "Edifício Aurora",
    unit: profile?.unitNumber || "204",
    deliveryDate: new Date(2025, 5, 15),
    contractDate: new Date(2024, 10, 20)
  };

  const recentDocuments = [
    { id: "1", title: "Contrato de Compra e Venda", date: new Date(2025, 3, 15), status: "disponivel" },
    { id: "2", title: "Manual do Proprietário", date: new Date(2025, 3, 20), status: "disponivel" },
    { id: "3", title: "Relatório de Vistoria", date: new Date(2025, 4, 10), status: "disponivel" }
  ];

  const upcomingInspections = [
    { id: "1", title: "Vistoria de Pré-entrega", date: new Date(2025, 5, 10), status: "agendada" },
    { id: "2", title: "Vistoria de Entrega", date: new Date(2025, 5, 15), status: "pendente" }
  ];

  const warrantyRequests = [
    { id: "1", title: "Reparo na torneira do banheiro", status: "em_andamento", priority: "media" },
    { id: "2", title: "Ajuste na porta da cozinha", status: "concluido", priority: "baixa" }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      disponivel: "default",
      agendada: "default",
      pendente: "secondary",
      em_andamento: "secondary",
      concluido: "outline"
    };
    return colors[status as keyof typeof colors] || "outline";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      disponivel: "Disponível",
      agendada: "Agendada",
      pendente: "Pendente",
      em_andamento: "Em Andamento",
      concluido: "Concluído"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const daysToDelivery = Math.ceil((userInfo.deliveryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const contractProgress = Math.min(((new Date().getTime() - userInfo.contractDate.getTime()) / (userInfo.deliveryDate.getTime() - userInfo.contractDate.getTime())) * 100, 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stage Indicator */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-h1">
            Bem-vindo, {userInfo.name}! 👋
          </h1>
          <p className="text-body-base">
            Acompanhe o progresso do seu imóvel e acesse seus documentos
          </p>
        </div>
        {stage && (
          <StageIndicator currentStage={stage} showDescription />
        )}
      </div>

      {/* Property Info Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                {userInfo.property}
              </CardTitle>
              <CardDescription className="text-base font-medium text-foreground/80">
                {userInfo.unit}
              </CardDescription>
            </div>
            <Badge variant="default" className="text-sm px-3 py-1">
              {daysToDelivery > 0 ? `${daysToDelivery} dias para entrega` : "Entregue"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progresso da obra</span>
              <span>{Math.round(contractProgress)}%</span>
            </div>
            <Progress value={contractProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Contrato: {userInfo.contractDate.toLocaleDateString()}</span>
              <span>Entrega: {userInfo.deliveryDate.toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Section */}
      <ClientTimeline 
        timeline={timeline} 
        title="Sua Jornada"
        description="Acompanhe cada etapa do processo do seu imóvel"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-layout-gap">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label">Documentos</p>
                <p className="text-h1">4</p>
                <p className="text-caption">3 disponíveis</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label">Vistorias</p>
                <p className="text-h1">2</p>
                <p className="text-caption">
                  {canScheduleInspection ? '1 agendada' : 'Aguardando liberação'}
                </p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label">Garantias</p>
                <p className="text-h1">{canRequestWarranty ? '2' : '-'}</p>
                <p className="text-caption">
                  {canRequestWarranty ? '1 em andamento' : 'Aguardando liberação'}
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label">Notificações</p>
                <p className="text-h1">{unreadCount}</p>
                <p className="text-caption">
                  {urgentNotifications.length > 0 ? `${urgentNotifications.length} urgentes` : 'nenhuma urgente'}
                </p>
              </div>
              <Bell className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-layout-gap">
        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos Recentes
              </CardTitle>
              <Link to="/client/documents">
                <Button variant="ghost" size="sm">
                  Ver todos <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-body-base font-semibold">{doc.title}</p>
                    <p className="text-caption">{doc.date.toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge variant={getStatusColor(doc.status) as any} className="text-xs">
                  {getStatusLabel(doc.status)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Inspections with Gate */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Próximas Vistorias
                {!canScheduleInspection && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
              <Link to="/client/inspections">
                <Button variant="ghost" size="sm">
                  Ver todas <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {canScheduleInspection ? (
              upcomingInspections.map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-body-base font-semibold">{inspection.title}</p>
                      <p className="text-caption">{inspection.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(inspection.status) as any} className="text-xs">
                    {getStatusLabel(inspection.status)}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  As vistorias serão liberadas em breve pelo administrador.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warranty Requests with Gate */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Solicitações de Garantia
                {!canRequestWarranty && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
              <Link to="/client/warranty">
                <Button variant="ghost" size="sm">
                  Ver todas <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {canRequestWarranty ? (
              warrantyRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-body-base font-semibold">{request.title}</p>
                      <p className="text-caption">Prioridade: {request.priority}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(request.status) as any} className="text-xs">
                    {getStatusLabel(request.status)}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  As garantias serão liberadas após a aprovação da vistoria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentNotifications.length > 0 ? (
              urgentNotifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-body-base font-semibold">{notification.title}</p>
                    <p className="text-caption">{notification.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 p-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação urgente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesse rapidamente as funcionalidades mais utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-layout-gap">
            <Link to="/client/documents">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <FileText className="h-6 w-6" />
                Meus Documentos
              </Button>
            </Link>
            
            {canScheduleInspection ? (
              <Link to="/client/inspections">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <ClipboardCheck className="h-6 w-6" />
                  Agendar Vistoria
                </Button>
              </Link>
            ) : (
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2" disabled>
                <Lock className="h-6 w-6" />
                Agendar Vistoria
              </Button>
            )}
            
            {canRequestWarranty ? (
              <Link to="/client/warranty">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <ShieldCheck className="h-6 w-6" />
                  Solicitar Garantia
                </Button>
              </Link>
            ) : (
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2" disabled>
                <Lock className="h-6 w-6" />
                Solicitar Garantia
              </Button>
            )}
            
            <Link to="/client/properties">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Home className="h-6 w-6" />
                Meu Imóvel
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
