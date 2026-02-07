
import { useState, useEffect } from "react";
import { warrantyFlowService } from "@/services/WarrantyFlowService";
import { WarrantyMetrics } from "@/types/warrantyFlow";
import { MetricsCards } from "./MetricsCards";
import { PerformanceCharts } from "./PerformanceCharts";
import { SLAComplianceChart } from "./SLAComplianceChart";
import { BottleneckAnalysis } from "./BottleneckAnalysis";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RefreshCw, Download, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function WarrantyMetricsDashboard() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<WarrantyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  const loadMetrics = () => {
    setIsLoading(true);
    try {
      const data = warrantyFlowService.calculateMetrics();
      setMetrics(data);
    } catch (error) {
      console.error("Error loading metrics:", error);
      toast({
        title: "Erro ao carregar métricas",
        description: "Não foi possível carregar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const handleExport = () => {
    toast({
      title: "Exportação iniciada",
      description: "O relatório será gerado e disponibilizado para download."
    });
    // In real implementation, generate PDF/Excel
  };

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Dashboard de Métricas</h2>
          <p className="text-sm text-muted-foreground">
            Visão geral do desempenho das garantias
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={loadMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards metrics={metrics} />

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA Compliance - Takes 1 column */}
        <SLAComplianceChart metrics={metrics} previousPeriodRate={85} />
        
        {/* Bottleneck Analysis - Takes 2 columns */}
        <div className="lg:col-span-2">
          <BottleneckAnalysis metrics={metrics} />
        </div>
      </div>

      {/* Performance Charts */}
      <PerformanceCharts metrics={metrics} />
    </div>
  );
}
