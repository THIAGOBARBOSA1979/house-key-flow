import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export const WarrantyGuide = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        Guia de Garantias
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <h3 className="font-medium">Garantias Cobertas:</h3>
        <ul className="mt-2 space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="font-medium">5 anos:</span> 
            <span className="text-muted-foreground">Problemas estruturais</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium">3 anos:</span> 
            <span className="text-muted-foreground">Impermeabilização</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium">2 anos:</span> 
            <span className="text-muted-foreground">Instalações hidráulicas e elétricas</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium">1 ano:</span> 
            <span className="text-muted-foreground">Acabamentos</span>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-medium">Não Cobertos:</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>Danos causados por uso inadequado</li>
          <li>Desgaste natural dos materiais</li>
          <li>Modificações feitas pelo proprietário</li>
          <li>Manutenção inadequada</li>
        </ul>
      </div>
    </CardContent>
    <CardFooter>
      <Button variant="outline" className="w-full">
        Ver manual completo de garantias
      </Button>
    </CardFooter>
  </Card>
);
