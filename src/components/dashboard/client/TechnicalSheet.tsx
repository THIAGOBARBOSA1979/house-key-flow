import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ShieldCheck, Map, Ruler, Sun, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TechnicalSheet = ({ 
  propertyArea, 
  totalArea, 
  deliveryDate, 
  warrantyStatus = "Ativa" 
}: { 
  propertyArea?: number; 
  totalArea?: number; 
  deliveryDate?: string; 
  warrantyStatus?: string;
}) => {
  const specs = [
    { label: "Área Privativa", value: propertyArea ? `${propertyArea} m²` : "85,40 m²", icon: Ruler },
    { label: "Área Total", value: totalArea ? `${totalArea} m²` : "112,20 m²", icon: Ruler },
    { label: "Vagas", value: "02 (G1)", icon: Map },
    { label: "Solar", value: "Norte/Leste", icon: Sun },
    { label: "Entrega", value: deliveryDate || "Dez/2025", icon: Calendar },
    { label: "Garantia", value: warrantyStatus, icon: ShieldCheck },
  ];

  const documents = [
    { name: "Manual do Proprietário", size: "4.2 MB", category: "Técnico" },
    { name: "Planta Humanizada", size: "1.8 MB", category: "Projetos" },
    { name: "Memorial Descritivo", size: "2.1 MB", category: "Legal" },
    { name: "Termo de Garantia", size: "1.5 MB", category: "Garantia" },
  ];

  return (
    <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden group">
      <CardHeader className="p-10 pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black tracking-tighter">Ficha Técnica</CardTitle>
            <CardDescription className="font-bold text-muted-foreground/60 uppercase text-[10px] tracking-widest">Protocolo da Unidade</CardDescription>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            <Info className="h-7 w-7" strokeWidth={2.5} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-10 pt-4 space-y-10">
        <div className="grid grid-cols-2 gap-6">
          {specs.map((spec) => (
            <div key={spec.label} className="p-5 rounded-3xl bg-muted/20 border border-border/5 hover:bg-muted/40 transition-all group/item">
              <div className="flex items-center gap-2 mb-2">
                <spec.icon className="h-3.5 w-3.5 text-primary group-hover/item:scale-110 transition-transform" strokeWidth={3} />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{spec.label}</span>
              </div>
              <p className="font-black text-base text-foreground tracking-tight">{spec.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Documentação Vital</h4>
            <Badge variant="outline" className="rounded-full text-[9px] font-black">4 Arquivos</Badge>
          </div>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between p-5 rounded-3xl bg-muted/10 border border-transparent hover:border-primary/20 hover:bg-white transition-all group/doc shadow-sm hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 rounded-2xl text-primary group-hover/doc:bg-primary group-hover/doc:text-white transition-all duration-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black group-hover/doc:text-primary transition-colors tracking-tight">{doc.name}</p>
                    <p className="text-[9px] font-black uppercase text-muted-foreground/40 mt-0.5">{doc.category} • {doc.size}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all">
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
