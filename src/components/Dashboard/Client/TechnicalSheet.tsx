import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ShieldCheck, Map, Ruler, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TechnicalSheet = () => {
  const specs = [
    { label: "Área Privativa", value: "85,40 m²", icon: Ruler },
    { label: "Área Total", value: "112,20 m²", icon: Ruler },
    { label: "Vagas de Garagem", value: "02 Vagas (G1)", icon: Map },
    { label: "Orientação Solar", value: "Norte/Leste", icon: Info },
    { label: "Data de Entrega", value: "Junho/2025", icon: ShieldCheck },
  ];

  const documents = [
    { name: "Manual do Proprietário", size: "4.2 MB", type: "PDF" },
    { name: "Planta Humanizada", size: "1.8 MB", type: "PDF" },
    { name: "Memorial Descritivo", size: "2.1 MB", type: "PDF" },
  ];

  return (
    <Card className="border-none shadow-xl overflow-hidden rounded-[2rem] bg-card/50 backdrop-blur-sm group">
      <CardHeader className="bg-muted/30 pb-6 p-8 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Ficha Técnica & Arquivos</CardTitle>
            <CardDescription className="text-sm font-bold text-muted-foreground">Especificações técnicas e documentação legal da unidade.</CardDescription>
          </div>
          <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:rotate-12 transition-transform duration-500">
            <FileText className="h-6 w-6" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specs.map((spec) => (
            <div key={spec.label} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/5 hover:bg-muted/40 transition-all group/item">
              <div className="p-2.5 bg-background rounded-xl text-muted-foreground group-hover/item:text-primary group-hover/item:scale-110 transition-all shadow-sm">
                <spec.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 leading-none mb-1">{spec.label}</p>
                <p className="font-black text-sm text-foreground truncate">{spec.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Documentos Rápidos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group/doc cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold group-hover/doc:text-primary transition-colors">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{doc.type} • {doc.size}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary hover:text-white transition-all h-9 w-9">
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
