
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SLAConfig, DEFAULT_SLA_CONFIGS } from "@/types/warrantyFlow";
import { warrantySLAService } from "@/services/WarrantySLAService";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Save, Clock, AlertCircle, Edit2 } from "lucide-react";

export function SLAConfigurationPanel() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<SLAConfig[]>(
    warrantySLAService.getAllSLAConfigs()
  );
  const [editingConfig, setEditingConfig] = useState<SLAConfig | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Convert hours to days for display
  const hoursToDays = (hours: number) => (hours / 24).toFixed(1);
  const daysToHours = (days: number) => Math.round(days * 24);

  const handleEdit = (config: SLAConfig) => {
    setEditingConfig({ ...config });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingConfig) return;
    
    // Validate
    if (editingConfig.analysisHours < 1 || 
        editingConfig.inspectionHours < 1 ||
        editingConfig.decisionHours < 1 ||
        editingConfig.executionHours < 1) {
      toast({
        title: "Erro de validação",
        description: "Todos os prazos devem ser maiores que zero.",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate total
    editingConfig.totalHours = 
      editingConfig.analysisHours +
      editingConfig.inspectionHours +
      editingConfig.decisionHours +
      editingConfig.executionHours;
    
    // Update in service
    warrantySLAService.updateSLAConfig(editingConfig);
    
    // Update local state
    setConfigs(prev => prev.map(c => 
      c.warrantyType === editingConfig.warrantyType ? editingConfig : c
    ));
    
    toast({
      title: "SLA atualizado",
      description: `Configuração para ${editingConfig.warrantyType} foi salva.`
    });
    
    setIsEditDialogOpen(false);
    setEditingConfig(null);
  };

  const handleInputChange = (field: keyof SLAConfig, value: string) => {
    if (!editingConfig) return;
    
    const days = parseFloat(value) || 0;
    const hours = daysToHours(days);
    
    setEditingConfig({
      ...editingConfig,
      [field]: hours
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração de SLA por Tipo
        </CardTitle>
        <CardDescription>
          Defina os prazos máximos (em dias úteis) para cada etapa do fluxo de garantia
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Info alert */}
        <div className="flex items-start gap-3 p-3 mb-4 rounded-lg bg-blue-50 border border-blue-200">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Como funciona o SLA</p>
            <p className="mt-1">
              O SLA define o prazo máximo para cada etapa do atendimento. 
              Quando o prazo é excedido, a solicitação é marcada como atrasada 
              e alertas são gerados automaticamente.
            </p>
          </div>
        </div>

        {/* SLA Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Garantia</TableHead>
                <TableHead className="text-center">Análise</TableHead>
                <TableHead className="text-center">Vistoria</TableHead>
                <TableHead className="text-center">Decisão</TableHead>
                <TableHead className="text-center">Execução</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.warrantyType}>
                  <TableCell className="font-medium">
                    {config.warrantyType}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {hoursToDays(config.analysisHours)}d
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {hoursToDays(config.inspectionHours)}d
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {hoursToDays(config.decisionHours)}d
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {hoursToDays(config.executionHours)}d
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge>
                      {hoursToDays(config.totalHours)}d
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(config)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Editar SLA - {editingConfig?.warrantyType}
              </DialogTitle>
              <DialogDescription>
                Defina os prazos em dias úteis para cada etapa
              </DialogDescription>
            </DialogHeader>
            
            {editingConfig && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="analysis">Análise (dias)</Label>
                    <Input
                      id="analysis"
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={hoursToDays(editingConfig.analysisHours)}
                      onChange={(e) => handleInputChange('analysisHours', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tempo para analisar a solicitação
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="inspection">Vistoria (dias)</Label>
                    <Input
                      id="inspection"
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={hoursToDays(editingConfig.inspectionHours)}
                      onChange={(e) => handleInputChange('inspectionHours', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tempo para agendar e realizar vistoria
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="decision">Decisão (dias)</Label>
                    <Input
                      id="decision"
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={hoursToDays(editingConfig.decisionHours)}
                      onChange={(e) => handleInputChange('decisionHours', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tempo para aprovar ou reprovar
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="execution">Execução (dias)</Label>
                    <Input
                      id="execution"
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={hoursToDays(editingConfig.executionHours)}
                      onChange={(e) => handleInputChange('executionHours', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tempo para realizar o reparo
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">SLA Total Estimado</span>
                  <Badge className="text-base">
                    {hoursToDays(
                      editingConfig.analysisHours +
                      editingConfig.inspectionHours +
                      editingConfig.decisionHours +
                      editingConfig.executionHours
                    )} dias
                  </Badge>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
