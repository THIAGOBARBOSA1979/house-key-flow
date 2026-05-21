import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ShieldCheck, Map, Ruler, Sun, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TechnicalSheet = () => {
  const specs = [
    { label: "Área Privativa", value: "85,40 m²", icon: Ruler },
    { label: "Área Total", value: "112,20 m²", icon: Ruler },
    { label: "Vagas", value: "02 (G1)", icon: Map },
    { label: "Solar", value: "Norte/Leste", icon: Sun },
    { label: "Entrega", value: "Dez/2025", icon: Calendar },
    { label: "Garantia", value: "Ativa", icon: ShieldCheck },
  ];

  const documents = [
    { name: "Manual do Proprietário", size: "4.2 MB", category: "Técnico" },
    { name: "Planta Humanizada", size: "1.8 MB", category: "Projetos" },
    { name: "Memorial Descritivo", size: "2.1 MB", category: "Legal" },
    { name: "Termo de Garantia", size: "1.5 MB", category: "Garantia" },
  ];

  return (
    <Card className="border-none shadow-sem-lg rounded-[2.5rem] bg-white/70 backdrop-blur-md overflow-hidden group">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black tracking-tight">Ficha Técnica</CardTitle>
            <CardDescription className="font-bold">Especificações da unidade</CardDescription>
          </div>
          <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
            <Info className="h-6 w-6" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          {specs.map((spec) => (
            <div key={spec.label} className="p-4 rounded-2xl bg-muted/20 border border-border/5 hover:bg-muted/40 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <spec.icon className="h-3 w-3 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{spec.label}</span>
              </div>
              <p className="font-black text-sm">{spec.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Acesso Rápido</h4>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/10 hover:border-primary/30 transition-all group/doc">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-xl text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black group-hover/doc:text-primary transition-colors">{doc.name}</p>
                    <p className="text-[9px] font-black uppercase text-muted-foreground/40">{doc.category} • {doc.size}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary hover:text-white transition-all">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
