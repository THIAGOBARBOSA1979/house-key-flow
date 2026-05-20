
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { ChecklistItem } from "@/services";

interface InspectionSummaryProps {
  totalItems: number;
  conformCount: number;
  nonConformItems: ChecklistItem[];
  extraNotes: string;
  onExtraNotesChange: (notes: string) => void;
  signature: string;
  onSignatureChange: (name: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const InspectionSummary = ({
  totalItems,
  conformCount,
  nonConformItems,
  extraNotes,
  onExtraNotesChange,
  signature,
  onSignatureChange,
  onBack,
  onSubmit,
  isSubmitting
}: InspectionSummaryProps) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Checklist
        </Button>
        <h2 className="text-xl font-bold">Resumo Estratégico</h2>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-inner rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">Consolidação de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border shadow-sm">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Taxa de Conformidade</p>
              <p className={cn(
                "text-3xl font-bold",
                (conformCount / (totalItems || 1)) > 0.9 ? "text-emerald-600" : "text-amber-600"
              )}>
                {Math.round((conformCount / (totalItems || 1)) * 100)}%
              </p>
            </div>
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border shadow-sm">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Não Conformidades</p>
              <p className="text-3xl font-bold text-red-600">{nonConformItems.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {nonConformItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2 text-red-600 px-1">
            <AlertCircle className="h-4 w-4" /> Detalhes de Falhas
          </h3>
          <div className="space-y-2">
            {nonConformItems.map(item => (
              <div key={item.id} className="p-4 border-l-4 border-l-red-500 bg-red-50/50 backdrop-blur-sm rounded-r-xl border border-red-100/50 shadow-sm">
                <p className="font-bold text-sm text-red-900">{item.name || item.description}</p>
                {item.notes && <p className="text-xs text-red-700 mt-1.5 italic font-medium">"{item.notes}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <Card className="border-muted bg-muted/10 rounded-2xl border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Observações Complementares</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Adicione observações gerais sobre a unidade ou o processo técnico..."
            value={extraNotes}
            onChange={(e) => onExtraNotesChange(e.target.value)}
            className="min-h-[100px] bg-background/50 rounded-xl"
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Assinatura Digital Responsável</CardTitle>
          <CardDescription className="text-xs font-medium">Ao confirmar, você atesta a veracidade das informações coletadas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signature" className="text-xs font-bold uppercase text-muted-foreground ml-1">Nome do Avaliador</Label>
            <Input 
              id="signature" 
              placeholder="Digite seu nome completo para assinar" 
              value={signature}
              onChange={e => onSignatureChange(e.target.value)}
              className="h-12 rounded-xl border-muted-foreground/20 focus:border-primary"
            />
          </div>
          <Button 
            className="w-full h-14 text-lg font-bold rounded-xl shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98]" 
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Finalizando Ciclo...
              </span>
            ) : "Confirmar e Finalizar Vistoria"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
