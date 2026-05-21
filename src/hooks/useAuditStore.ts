import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuditIssue {
  id: string;
  module: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'fixed';
  wave: number;
}

export interface AuditWave {
  id: number;
  status: 'pending' | 'in_progress' | 'completed';
  issues: string[]; // IDs of AuditIssue
  completedAt?: string;
}

interface AuditState {
  totalIssues: number;
  fixedIssues: number;
  issues: AuditIssue[];
  waves: AuditWave[];
  currentWave: number;
  
  // Actions
  addIssue: (issue: Omit<AuditIssue, 'id' | 'status'>) => void;
  markAsFixed: (id: string) => void;
  startWave: (waveId: number) => void;
  completeWave: (waveId: number) => void;
  getCompletionPercentage: () => number;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      totalIssues: 0,
      fixedIssues: 0,
      issues: [],
      waves: [],
      currentWave: 0,

      addIssue: (issue) => set((state) => {
        const newIssue = { ...issue, id: crypto.randomUUID(), status: 'pending' as const };
        const newIssues = [...state.issues, newIssue];
        return {
          issues: newIssues,
          totalIssues: newIssues.length
        };
      }),

      markAsFixed: (id) => set((state) => {
        const newIssues = state.issues.map(i => i.id === id ? { ...i, status: 'fixed' as const } : i);
        return {
          issues: newIssues,
          fixedIssues: newIssues.filter(i => i.status === 'fixed').length
        };
      }),

      startWave: (waveId) => set((state) => ({
        currentWave: waveId,
        waves: state.waves.map(w => w.id === waveId ? { ...w, status: 'in_progress' as const } : w)
      })),

      completeWave: (waveId) => set((state) => ({
        waves: state.waves.map(w => w.id === waveId ? { ...w, status: 'completed' as const, completedAt: new Date().toISOString() } : w)
      })),

      getCompletionPercentage: () => {
        const state = get();
        if (state.totalIssues === 0) return 0;
        return Math.round((state.fixedIssues / state.totalIssues) * 100);
      }
    }),
    {
      name: 'audit-storage',
    }
  )
);
