import { useAuditStore } from './useAuditStore';
import { useEffect } from 'react';

const INITIAL_ISSUES = [
  // Wave 1: Core Layout & Navigation
  { module: 'Layout', description: 'Menu lateral responsivo no mobile apresenta sobreposição indesejada', impact: 'high', wave: 1 },
  { module: 'Navigation', description: 'Redirecionamentos de login legados (/admin/login) precisam de validação extra', impact: 'medium', wave: 1 },
  { module: 'Auth', description: 'Persistência de sessão em abas múltiplas causando logouts inesperados', impact: 'high', wave: 1 },
  
  // Wave 2: Client Portal & Dashboard
  { module: 'Dashboard', description: 'Mocks de dados no ConstructionFeed precisam ser substituídos por dados do Supabase', impact: 'high', wave: 2 },
  { module: 'Dashboard', description: 'Cards de "Vistorias" e "Garantias" no Dashboard sem fallback de estado vazio', impact: 'medium', wave: 2 },
  { module: 'Dashboard', description: 'Layout do "Command Center" quebra em tablets na orientação vertical', impact: 'medium', wave: 2 },

  // Wave 3: Warranty & Business Logic
  { module: 'Warranty', description: 'Validação de garantia no WarrantyValidationService usa mocks estáticos', impact: 'critical', wave: 3 },
  { module: 'Warranty', description: 'Fluxo de abertura de chamado não valida limites de upload de fotos', impact: 'medium', wave: 3 },
  { module: 'Warranty', description: 'SLA de garantia não está sendo calculado corretamente em fins de semana', impact: 'high', wave: 3 },
  // Wave 5: UX Refinement & Edge Case Handling
  { module: 'UX', description: 'Modais de criação de vistoria sem feedback visual de progresso durante upload', impact: 'medium', wave: 5 },
  { module: 'UI', description: 'Dashboards sem estados de fallback "Empty State" para novos usuários/empresas', impact: 'low', wave: 5 },
  { module: 'Responsive', description: 'Quebra de layout no Kanban de Garantias em telas Ultra-Wide (>2000px)', impact: 'low', wave: 5 },
  { module: 'Performance', description: 'Re-renderizações excessivas no menu lateral ao alternar rotas', impact: 'medium', wave: 5 },
  { module: 'Error Handling', description: 'Exceções não tratadas em falhas de rede durante download de documentos', impact: 'high', wave: 5 },
];

export const useAuditInitializer = () => {
  const { issues, waves, addIssue, startWave } = useAuditStore();

  useEffect(() => {
    if (issues.length === 0) {
      INITIAL_ISSUES.forEach(issue => addIssue(issue as any));
      
      // Initialize waves
      useAuditStore.setState(state => ({
        ...state,
        waves: [
          { id: 1, status: 'completed', issues: [] },
          { id: 2, status: 'completed', issues: [] },
          { id: 3, status: 'completed', issues: [] },
          { id: 4, status: 'completed', issues: [] },
          { id: 5, status: 'in_progress', issues: [] }
        ],
        currentWave: 5
      }));
    }
  }, []);
};
