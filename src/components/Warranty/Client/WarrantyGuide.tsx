import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export const WarrantyGuide = () => (
  <Card className="shadow-sem-lg border-none bg-white/70 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
    <CardHeader className="p-8 pb-4">
      <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
          <ShieldCheck className="h-6 w-6" strokeWidth={2.5} />
        </div>
        Manual de Garantias
      </CardTitle>
    </CardHeader>
    <CardContent className="p-8 pt-4 space-y-8">
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Prazos de Cobertura ABNT</h3>
        <ul className="space-y-4">
          <li className="flex flex-col gap-1 p-3 rounded-2xl bg-muted/20 border border-border/5">
            <span className="font-black text-xs text-primary uppercase tracking-widest">Estrutura • 5 Anos</span> 
            <span className="text-[11px] font-bold text-muted-foreground leading-relaxed">Fundações, pilares, vigas e lajes estruturais conforme NBR 15575.</span>
          </li>
          <li className="flex flex-col gap-1 p-3 rounded-2xl bg-muted/20 border border-border/5">
            <span className="font-black text-xs text-primary uppercase tracking-widest">Impermeabilização • 3 Anos</span> 
            <span className="text-[11px] font-bold text-muted-foreground leading-relaxed">Estanqueidade de lajes, piscinas e áreas molhadas.</span>
          </li>
          <li className="flex flex-col gap-1 p-3 rounded-2xl bg-muted/20 border border-border/5">
            <span className="font-black text-xs text-primary uppercase tracking-widest">Instalações • 2 Anos</span> 
            <span className="text-[11px] font-bold text-muted-foreground leading-relaxed">Sistemas hidráulicos, elétricos e de gás (tubulações e conexões).</span>
          </li>
          <li className="flex flex-col gap-1 p-3 rounded-2xl bg-muted/20 border border-border/5">
            <span className="font-black text-xs text-primary uppercase tracking-widest">Acabamentos • 1 Ano</span> 
            <span className="text-[11px] font-bold text-muted-foreground leading-relaxed">Revestimentos, esquadrias, louças e metais sanitários.</span>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Exclusões de Cobertura</h3>
        <ul className="space-y-3">
          {["Uso inadequado ou negligência", "Desgaste natural por exposição", "Modificações estruturais por terceiros", "Falta de manutenção preventiva"].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground/80">
              <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
    <CardFooter className="p-8 pt-0">
      <Button variant="outline" className="w-full h-12 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] transition-all hover:bg-primary/5 active:scale-95">
        Acessar Memorial Descritivo
      </Button>
    </CardFooter>
  </Card>
);
