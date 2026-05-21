import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Database, 
  Cloud, 
  Wifi, 
  Cpu, 
  Server,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const SystemHealth = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uptime, setUptime] = useState("99.98%");
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const systems = [
    { name: "Banco de Dados (Supabase)", status: "online", latency: "14ms", icon: Database },
    { name: "Storage (Imagens/Documentos)", status: "online", latency: "22ms", icon: Cloud },
    { name: "API Gateway", status: "online", latency: "31ms", icon: Server },
    { name: "Webhooks Engine", status: "online", latency: "12ms", icon: Activity },
    { name: "Auth Service", status: "online", latency: "18ms", icon: Wifi },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="lg:col-span-2 rounded-[2.5rem] border-none bg-card/40 backdrop-blur-md shadow-sem-lg overflow-hidden">
        <CardHeader className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                <Activity className="text-primary" /> Status da Infraestrutura
              </CardTitle>
              <CardDescription>Monitoramento em tempo real dos serviços críticos do ecossistema A2.</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl h-10 w-10 hover:bg-primary/5"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systems.map((system) => (
              <div key={system.name} className="p-4 rounded-2xl bg-muted/30 border border-border/5 flex items-center justify-between group hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <system.icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{system.name}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">Latência: {system.latency}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black text-[9px] uppercase tracking-tighter">
                  <CheckCircle2 size={10} className="mr-1" /> Online
                </Badge>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-border/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Uptime Médio (30 dias)</span>
              <span className="text-sm font-black text-primary">{uptime}</span>
            </div>
            <Progress value={99.98} className="h-2 rounded-full bg-muted/40" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-none bg-card/40 backdrop-blur-md shadow-sem-lg overflow-hidden flex flex-col">
        <CardHeader className="p-8">
          <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
            <Cpu className="text-primary" /> Performance & Carga
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-8 flex-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Uso de CPU</span>
              <span className="text-sm font-black text-amber-600">42%</span>
            </div>
            <Progress value={42} className="h-2 rounded-full bg-muted/40" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Memória (RAM)</span>
              <span className="text-sm font-black text-primary">2.4 GB / 4.0 GB</span>
            </div>
            <Progress value={60} className="h-2 rounded-full bg-muted/40" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">I/O de Disco</span>
              <span className="text-sm font-black text-emerald-600">12%</span>
            </div>
            <Progress value={12} className="h-2 rounded-full bg-muted/40" />
          </div>

          <div className="pt-4 mt-auto">
             <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-start gap-3">
               <CheckCircle2 className="text-emerald-600 mt-0.5" size={16} />
               <p className="text-[11px] font-medium text-emerald-800 leading-relaxed">
                 Todos os módulos técnicos (Garantias e Vistorias) estão operando dentro dos SLAs de performance ABNT.
               </p>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
