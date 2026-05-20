import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export const TechnicalSheet = () => (
  <Card className="border-none shadow-md overflow-hidden rounded-[2rem]">
    <CardHeader className="bg-muted/30 pb-4 p-6">
      <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Ficha Técnica do Imóvel</CardTitle>
    </CardHeader>
    {/* Content can be expanded later if needed */}
  </Card>
);
