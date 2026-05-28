import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { financialService, ClientInvoice } from "@/services/operations/FinancialService";
import { 
  CreditCard, 
  Download, 
  ExternalLink, 
  FileText, 
  History, 
  Info, 
  PieChart, 
  Receipt, 
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Financial = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      financialService.getClientInvoices(user.id).then(data => {
        setInvoices(data);
        setIsLoading(false);
      });
    }
  }, [user?.id]);

  const stats = {
    pending: invoices.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.amount, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0),
    totalCount: invoices.length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-emerald-500 text-white border-none font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">Pago</Badge>;
      case 'pending': return <Badge variant="outline" className="border-amber-500 text-amber-600 font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">Pendente</Badge>;
      case 'overdue': return <Badge className="bg-destructive text-white border-none font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">Atrasado</Badge>;
      default: return <Badge variant="outline" className="font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  return (
    <div className="container-responsive py-8 space-y-12 animate-in fade-in duration-slow">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Gestão Financeira • Unidade {user?.id?.substring(0,4)}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
            Meu <span className="text-primary">Financeiro</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6">
            <Download className="mr-2 h-4 w-4" /> Relatório Anual
          </Button>
          <Button className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-xl shadow-primary/20">
            <CreditCard className="mr-2 h-4 w-4" /> Pagar Próximo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Summary Cards */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-gradient-to-br from-primary to-primary-foreground/10 text-white p-8 overflow-hidden relative group">
            <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:rotate-12 transition-transform duration-1000">
              <Wallet size={200} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="p-3 bg-white/10 rounded-2xl w-fit">
                <Receipt size={24} strokeWidth={3} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Saldo Pendente</p>
                <h3 className="text-4xl font-black tracking-tighter mt-1">R$ {stats.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              </div>
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Próximo Vencimento</p>
                  <p className="font-bold">15 de Junho</p>
                </div>
                <Button size="sm" className="bg-white text-primary hover:bg-white/90 rounded-xl font-black uppercase text-[10px] tracking-widest">Pagar</Button>
              </div>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <PieChart size={20} strokeWidth={3} />
              </div>
              <h3 className="text-lg font-black tracking-tighter">Status de Pagamento</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>Adimplência Anual</span>
                  <span className="text-emerald-600">92%</span>
                </div>
                <Progress value={92} className="h-2 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/5">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total Pago</p>
                  <p className="text-sm font-black">R$ {stats.paid.toLocaleString('pt-BR')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Parcelas</p>
                  <p className="text-sm font-black">{invoices.filter(i => i.status === 'paid').length}/{stats.totalCount}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-md bg-muted/20 p-8 space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Info size={18} strokeWidth={3} />
              <h4 className="font-black text-xs uppercase tracking-widest">Informação Importante</h4>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Pagamentos via PIX ou Boleto Bancário podem levar até 48 horas úteis para serem compensados em nosso sistema de governança.
            </p>
          </Card>
        </div>

        {/* Right: Invoices Table */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between mb-8">
              <TabsList className="bg-muted/50 rounded-2xl h-12 p-1 border border-border/10">
                <TabsTrigger value="all" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">Todos</TabsTrigger>
                <TabsTrigger value="pending" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">Pendentes</TabsTrigger>
                <TabsTrigger value="paid" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">Pagos</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <History size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Histórico Completo</span>
              </div>
            </div>

            <TabsContent value="all" className="mt-0 space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sincronizando registros...</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 border-2 border-dashed border-border/20 rounded-[2.5rem] bg-white">
                  <div className="p-6 bg-muted/30 rounded-full text-muted-foreground">
                    <FileText size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tighter">Nenhum registro encontrado</h3>
                    <p className="text-sm text-muted-foreground font-medium max-w-[280px] mx-auto mt-2">Você não possui faturas ou boletos lançados no momento.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <Card key={invoice.id} className="rounded-3xl border border-border/5 hover:border-primary/20 hover:shadow-xl transition-all duration-300 bg-white group">
                      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                            invoice.status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-primary/5 text-primary"
                          )}>
                            <Receipt size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{invoice.title}</h4>
                              {getStatusBadge(invoice.status)}
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              <span className="flex items-center gap-1.5"><Clock size={12} /> Vencimento: {format(new Date(invoice.due_date), 'dd/MM/yyyy')}</span>
                              <span className="flex items-center gap-1.5">ID: {invoice.id.substring(0,8)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between md:justify-end gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-border/5">
                          <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Valor Total</p>
                            <p className="text-xl font-black tracking-tighter">R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 hover:bg-primary/5 text-primary">
                               <Download size={20} />
                             </Button>
                             {invoice.status !== 'paid' && (
                               <Button className="rounded-xl h-12 font-black uppercase tracking-widest text-[10px] px-6">Pagar</Button>
                             )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
               {/* Similar logic but filtered */}
               <div className="py-20 text-center border-2 border-dashed rounded-[2.5rem]">
                 <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Apenas faturas pendentes</p>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Financial;
