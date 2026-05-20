import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink } from "lucide-react";

export const QuickDocuments = () => (
  <Card className="border-dashed shadow-none bg-muted/20 rounded-3xl">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-bold flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        Documentos Rápidos
      </CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 gap-2">
      <Button variant="outline" size="sm" className="justify-between text-xs font-bold rounded-2xl h-12 border-muted-foreground/20 hover:border-primary hover:text-primary transition-all">
        Extrato Consolidado <Download className="h-3 w-3" />
      </Button>
      <Button variant="outline" size="sm" className="justify-between text-xs font-bold rounded-2xl h-12 border-muted-foreground/20 hover:border-primary hover:text-primary transition-all">
        Informe de Rendimentos <ExternalLink className="h-3 w-3" />
      </Button>
    </CardContent>
  </Card>
);
