import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Home, Building2, TrendingUp, Calendar, MapPin } from "lucide-react";

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
  <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 shadow-xl overflow-hidden relative rounded-3xl group">
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700 group-hover:scale-110">
      <Home className="h-32 w-32" />
    </div>
    <CardHeader className="relative z-10 pb-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <CardTitle className="text-2xl font-black flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            {property}
          </CardTitle>
          <div className="flex items-center gap-3 mt-3">
            <div className="bg-muted px-2.5 py-1 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest border border-border/50">
              Unidade {unit}
            </div>
            <div className="bg-primary/5 px-2.5 py-1 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest border border-primary/10">
              Bloco A
            </div>
          </div>
        </div>
        <Badge variant="default" className="bg-primary text-primary-foreground border-none font-black uppercase tracking-tighter text-[11px] px-4 py-2 shadow-lg shadow-primary/20 animate-pulse rounded-full">
          {daysToDelivery > 0 ? `${daysToDelivery} dias para entrega` : "Imóvel Entregue"}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="pt-2">
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Evolução da Obra</span>
            </div>
            <p className="text-3xl font-black text-primary tracking-tighter">{Math.round(contractProgress)}%</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Previsão</span>
            <p className="font-bold text-foreground">{deliveryDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="relative pt-1">
          <Progress value={contractProgress} className="h-3 bg-primary/10 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-primary/5 shadow-sm group-hover:bg-white/80 transition-all duration-500">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground/60 leading-none mb-1.5 tracking-wider">Assinatura</p>
              <span className="font-bold text-foreground">{contractDate.toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-primary/5 shadow-sm group-hover:bg-white/80 transition-all duration-500">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground/60 leading-none mb-1.5 tracking-wider">Endereço</p>
              <span className="font-bold text-foreground">Av. Principal, 1000 - SP</span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
