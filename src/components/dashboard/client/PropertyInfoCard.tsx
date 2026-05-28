import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Home, Building2, TrendingUp, Calendar, Clock, MapPin } from "lucide-react";

interface PropertyInfoCardProps {
  property: string;
  unit: string;
  daysToDelivery: number;
  contractProgress: number;
  deliveryDate: Date;
  contractDate: Date;
  location?: string;
  block?: string;
}

export const PropertyInfoCard = ({
  property,
  unit,
  daysToDelivery,
  contractProgress,
  deliveryDate,
  contractDate,
  location,
  block
}: PropertyInfoCardProps) => (
  <Card className="bg-gradient-to-br from-background via-background to-primary/5 border-border/40 shadow-sem-lg rounded-[2rem] overflow-hidden relative group">
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
      <Home className="h-40 w-40" />
    </div>
    <CardHeader className="relative z-10 p-8 pb-4">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-4">
          <CardTitle className="text-3xl sm:text-4xl font-black tracking-tighter flex items-center gap-4">
            <div className="p-4 bg-primary text-white rounded-[1.5rem] shadow-xl shadow-primary/20 shrink-0">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />
            </div>
            <span className="truncate">{property}</span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-background px-4 py-1.5 font-black uppercase tracking-widest text-[9px] sm:text-[10px] rounded-xl border-2">
              Unidade {unit}
            </Badge>
            {block && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[9px] sm:text-[10px] px-4 py-1.5 rounded-xl">
                {block}
              </Badge>
            )}
            <Badge className="bg-emerald-500 text-white border-none font-black uppercase tracking-widest text-[9px] sm:text-[10px] px-4 py-1.5 rounded-xl shadow-lg shadow-emerald-500/10">
              Ativo
            </Badge>
          </div>
        </div>
        {daysToDelivery > 0 && (
          <div className="bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-[2rem] border border-primary/10 shadow-xl flex flex-col items-center justify-center min-w-[120px] sm:min-w-[140px] group-hover:scale-105 transition-transform duration-700">
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 text-center leading-tight">Contagem Regressiva</p>
            <p className="text-2xl sm:text-3xl font-black text-primary tracking-tighter">{daysToDelivery}</p>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary text-center">Dias para chaves</p>
          </div>
        )}
      </div>
    </CardHeader>
    <CardContent className="p-8 pt-2">
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={12} /> Evolução Técnica
            </span>
            <p className="text-3xl sm:text-4xl font-black text-primary tracking-tighter">{Math.round(contractProgress)}%</p>
          </div>
          <div className="text-right">
            <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Entrega</span>
            <p className="font-black text-sm sm:text-base text-foreground">{deliveryDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <Progress value={contractProgress} className="h-2 bg-primary/10 rounded-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border/5">
            <div className="p-2 bg-background rounded-xl text-primary shadow-sm">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Assinatura</p>
              <p className="text-xs font-black">{contractDate.toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border/5">
            <div className="p-2 bg-background rounded-xl text-primary shadow-sm">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Localização</p>
              <p className="text-xs font-black truncate max-w-[120px]">{location || "São Paulo - SP"}</p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
