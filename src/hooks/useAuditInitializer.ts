import { useAuditStore } from './useAuditStore';
import { useEffect } from 'react';

const INITIAL_ISSUES = [
  // Wave 1-9 (Keep existing descriptions or summarize)
  { module: 'Compliance', description: 'Implementação de RBAC rigoroso e isolamento de tenants', impact: 'critical', wave: 9 },
  
  // Wave 10: Persistência Real
  { module: 'Warranty', description: 'Refatoração do WarrantyValidationService para persistência real', status: 'fixed', impact: 'critical', wave: 10 },
  { module: 'Warranty', description: 'Refatoração do WarrantyFlowService eliminando mocks', status: 'fixed', impact: 'critical', wave: 10 },
  { module: 'Governance', description: 'Padronização de auditoria em todos os métodos de mutação', status: 'fixed', impact: 'high', wave: 10 },

  // Wave 11: Estabilização de Interface
  { module: 'UI/UX', description: 'Correção de resíduos de tipagem na gestão de documentos', status: 'fixed', impact: 'high', wave: 11 },
  { module: 'Support', description: 'Estabilização do fluxo de tickets com persistência real', status: 'fixed', impact: 'medium', wave: 11 },

  // Wave 12: Eliminação Total de Mocks
  { module: 'SLA', description: 'Migração do WarrantySLAService para persistência via Supabase', status: 'fixed', impact: 'high', wave: 12 },
  { module: 'Sync', description: 'Remoção de hardcoded URLs e lógica de mock no SyncService', status: 'fixed', impact: 'medium', wave: 12 },
  { module: 'Legacy', description: 'Refatoração final de serviços legados (Technician, Property, Inspection)', status: 'fixed', impact: 'high', wave: 12 },

  // Wave 13: Consolidação de Lógica Core
  { module: 'Core', description: 'Implementação de validação Zod no SupabaseBaseService', status: 'fixed', impact: 'high', wave: 13 },
  { module: 'Core', description: 'Unificação de tipos entre frontend e backend (Supabase Types)', status: 'fixed', impact: 'medium', wave: 13 },
  { module: 'Architecture', description: 'Aplicação rigorosa do padrão Result<T> no service layer', status: 'fixed', impact: 'high', wave: 13 },

  // Wave 14: Segurança e Hardening
  { module: 'Security', description: 'Auditoria rigorosa de RLS e checagem de super_admin', status: 'fixed', impact: 'critical', wave: 14 },
  { module: 'Multi-tenancy', description: 'Isolamento garantido de dados por company_id em todas as queries', status: 'fixed', impact: 'critical', wave: 14 },

  // Wave 15: Observabilidade e DX
  { module: 'DevOps', description: 'Documentação técnica abrangente e guia de contribuição (README)', status: 'fixed', impact: 'medium', wave: 15 },
  { module: 'Observability', description: 'Dashboard de saúde do sistema integrado com logs de auditoria', status: 'fixed', impact: 'medium', wave: 15 },
];

export const useAuditInitializer = () => {
  const { issues, waves, addIssue, startWave, completeWave, markAsFixed } = useAuditStore();

  useEffect(() => {
    if (issues.length === 0) {
      INITIAL_ISSUES.forEach(issue => addIssue(issue as any));
      
      // Initialize waves as completed for previous ones
      for (let i = 1; i <= 15; i++) {
        useAuditStore.setState(state => {
          if (!state.waves.find(w => w.id === i)) {
            return {
              ...state,
              waves: [...state.waves, { id: i, status: 'completed', issues: [] }]
            };
          }
          return state;
        });
      }
      
      }));
    }
  }, [issues.length, addIssue, startWave]);

  // Specific check for waves completion
  useEffect(() => {
    if (issues.length > 0) {
      [12, 13, 14, 15].forEach(waveId => {
        const waveIssues = INITIAL_ISSUES.filter(i => i.wave === waveId);
        const fixedIssues = issues.filter(i => i.wave === waveId && i.status === 'fixed');
        
        if (waveIssues.length > 0 && fixedIssues.length === waveIssues.length && waves.find(w => w.id === waveId)?.status !== 'completed') {
          completeWave(waveId);
          if (waveId < 15) startWave(waveId + 1);
        }
      });
    }
  }, [issues, waves, completeWave, startWave]);
};
