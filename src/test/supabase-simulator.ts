import { vi } from 'vitest';

export interface MockTable {
  name: string;
  data: any[];
}

export class SupabaseSimulator {
  private tables: Map<string, any[]> = new Map();
  private latency = 0;
  private failRate = 0;

  constructor(initialData: MockTable[] = []) {
    initialData.forEach(t => this.tables.set(t.name, [...t.data]));
  }

  setLatency(ms: number) { this.latency = ms; }
  setFailRate(rate: number) { this.failRate = rate; } // 0 to 1

  private async simulate() {
    if (this.latency > 0) await new Promise(r => setTimeout(r, this.latency));
    if (Math.random() < this.failRate) throw new Error('Simulated Supabase Failure');
  }

  getBuilder(tableName: string) {
    const tableData = this.tables.get(tableName) || [];
    let currentData = [...tableData];

    const builder = {
      select: vi.fn((columns?: string) => builder),
      eq: vi.fn((column: string, value: any) => {
        currentData = currentData.filter(item => item[column] === value);
        return builder;
      }),
      in: vi.fn((column: string, values: any[]) => {
        currentData = currentData.filter(item => values.includes(item[column]));
        return builder;
      }),
      order: vi.fn((column: string, { ascending = true } = {}) => {
        currentData.sort((a, b) => {
          if (a[column] < b[column]) return ascending ? -1 : 1;
          if (a[column] > b[column]) return ascending ? 1 : -1;
          return 0;
        });
        return builder;
      }),
      limit: vi.fn((count: number) => {
        currentData = currentData.slice(0, count);
        return builder;
      }),
      range: vi.fn((from: number, to: number) => {
        currentData = currentData.slice(from, to + 1);
        return builder;
      }),
      maybeSingle: vi.fn(async () => {
        await this.simulate();
        return { data: currentData[0] || null, error: null };
      }),
      single: vi.fn(async () => {
        await this.simulate();
        if (currentData.length === 0) return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
        return { data: currentData[0], error: null };
      }),
      insert: vi.fn(async (payload: any) => {
        await this.simulate();
        const rows = Array.isArray(payload) ? payload : [payload];
        const newRows = rows.map(r => ({ ...r, id: r.id || crypto.randomUUID(), created_at: new Date().toISOString() }));
        this.tables.set(tableName, [...tableData, ...newRows]);
        return { data: Array.isArray(payload) ? newRows : newRows[0], error: null };
      }),
      update: vi.fn(async (payload: any) => {
        await this.simulate();
        // This is a simplified update that applies to the currently filtered set
        const updatedIds = currentData.map(d => d.id);
        const allTableData = this.tables.get(tableName) || [];
        const newTableData = allTableData.map(item => 
          updatedIds.includes(item.id) ? { ...item, ...payload, updated_at: new Date().toISOString() } : item
        );
        this.tables.set(tableName, newTableData);
        return { data: payload, error: null };
      }),
      delete: vi.fn(async () => {
        await this.simulate();
        const deletedIds = currentData.map(d => d.id);
        const allTableData = this.tables.get(tableName) || [];
        const newTableData = allTableData.filter(item => !deletedIds.includes(item.id));
        this.tables.set(tableName, newTableData);
        return { data: null, error: null };
      }),
      // Mock for RPC calls
      rpc: vi.fn(async (fnName: string, params: any) => {
        await this.simulate();
        return { data: { success: true }, error: null };
      })
    };

    return builder;
  }
}

export const simulator = new SupabaseSimulator([
  { name: 'profiles', data: [
    { id: 'u1', company_id: 'tenant-1', role: 'admin', full_name: 'Admin Tenant 1' },
    { id: 'u2', company_id: 'tenant-2', role: 'client', full_name: 'Client Tenant 2' }
  ]},
  { name: 'a2_properties', data: [
    { id: 'p1', company_id: 'tenant-1', name: 'Prop 1' }
  ]}
]);
