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
}

export const PropertyInfoCard = ({
  property,
  unit,
  daysToDelivery,
  contractProgress,
  deliveryDate,
  contractDate
}: PropertyInfoCardProps) => (
  <Card className="bg-gradient-to-br from-background via-background to-primary/5 border-border/40 shadow-sem-lg rounded-[2rem] overflow-hidden relative group">
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
      <Home className="h-40 w-40" />
    </div>
    <CardHeader className="relative z-10 p-8 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            {property}
          </CardTitle>
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="outline" className="bg-background px-3 py-1 font-black uppercase tracking-widest text-[10px]">
              Unidade {unit}
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[10px]">
              Bloco A
            </Badge>
          </div>
        </div>
        {daysToDelivery > 0 && (
          <Badge className="bg-primary text-primary-foreground font-black uppercase tracking-tighter text-[10px] px-4 py-1.5 shadow-lg rounded-full">
            {daysToDelivery} dias para entrega
          </Badge>
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
            <p className="text-4xl font-black text-primary tracking-tighter">{Math.round(contractProgress)}%</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Entrega</span>
            <p className="font-black text-foreground">{deliveryDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</p>
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
              <p className="text-xs font-black truncate max-w-[120px]">São Paulo - SP</p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
