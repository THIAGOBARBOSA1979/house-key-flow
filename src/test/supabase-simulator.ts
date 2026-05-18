import { vi } from 'vitest';

export interface SimulatorOptions {
  latency?: number;
  failRate?: number;
}

export class SupabaseSimulator {
  private tables: Map<string, any[]> = new Map();
  private options: SimulatorOptions = { latency: 0, failRate: 0 };

  constructor(initialData: Record<string, any[]> = {}) {
    Object.entries(initialData).forEach(([name, data]) => {
      this.tables.set(name, [...data]);
    });
  }

  setOptions(options: SimulatorOptions) {
    this.options = { ...this.options, ...options };
  }

  private async simulateNetwork() {
    if (this.options.latency) {
      await new Promise(resolve => setTimeout(resolve, this.options.latency));
    }
    if (this.options.failRate && Math.random() < this.options.failRate) {
      throw {
        message: 'Simulated Network Error',
        code: '500',
        details: 'Intermittent failure'
      };
    }
  }

  getBuilder(tableName: string) {
    const tableData = this.tables.get(tableName) || [];
    let queryData = [...tableData];

    const builder = {
      select: vi.fn((columns?: string) => builder),
      eq: vi.fn((column: string, value: any) => {
        queryData = queryData.filter(item => item[column] === value);
        return builder;
      }),
      in: vi.fn((column: string, values: any[]) => {
        queryData = queryData.filter(item => values.includes(item[column]));
        return builder;
      }),
      ilike: vi.fn((column: string, pattern: string) => {
        const regex = new RegExp(pattern.replace(/%/g, '.*'), 'i');
        queryData = queryData.filter(item => regex.test(item[column]));
        return builder;
      }),
      order: vi.fn((column: string, { ascending = true } = {}) => {
        queryData.sort((a, b) => {
          if (a[column] < b[column]) return ascending ? -1 : 1;
          if (a[column] > b[column]) return ascending ? 1 : -1;
          return 0;
        });
        return builder;
      }),
      range: vi.fn((from: number, to: number) => {
        queryData = queryData.slice(from, to + 1);
        return builder;
      }),
      limit: vi.fn((count: number) => {
        queryData = queryData.slice(0, count);
        return builder;
      }),
      maybeSingle: vi.fn(async () => {
        await this.simulateNetwork();
        return { data: queryData[0] || null, error: null };
      }),
      single: vi.fn(async () => {
        await this.simulateNetwork();
        if (queryData.length === 0) return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
        return { data: queryData[0], error: null };
      }),
      then: (onfulfilled: any) => {
        return Promise.resolve({ data: queryData, error: null }).then(onfulfilled);
      },
      insert: vi.fn(async (payload: any) => {
        await this.simulateNetwork();
        const rows = Array.isArray(payload) ? payload : [payload];
        const newRows = rows.map(r => ({ ...r, id: r.id || crypto.randomUUID(), created_at: new Date().toISOString() }));
        this.tables.set(tableName, [...tableData, ...newRows]);
        return { data: Array.isArray(payload) ? newRows : newRows[0], error: null };
      }),
      update: vi.fn(async (payload: any) => {
        await this.simulateNetwork();
        const updatedIds = queryData.map(d => d.id);
        const allData = this.tables.get(tableName) || [];
        const newData = allData.map(item => 
          updatedIds.includes(item.id) ? { ...item, ...payload, updated_at: new Date().toISOString() } : item
        );
        this.tables.set(tableName, newData);
        return { data: payload, error: null };
      }),
      delete: vi.fn(async () => {
        await this.simulateNetwork();
        const deletedIds = queryData.map(d => d.id);
        const allData = this.tables.get(tableName) || [];
        const newData = allData.filter(item => !deletedIds.includes(item.id));
        this.tables.set(tableName, newData);
        return { data: null, error: null };
      }),
      rpc: vi.fn(async (name: string, params: any) => {
        await this.simulateNetwork();
        return { data: { success: true }, error: null };
      })
    };

    return builder;
  }
}

export const simulator = new SupabaseSimulator({
  profiles: [
    { id: 'u1', company_id: 'tenant-1', role: 'admin', full_name: 'Admin T1' },
    { id: 'u2', company_id: 'tenant-2', role: 'client', full_name: 'Client T2' }
  ],
  a2_properties: [
    { id: 'p1', company_id: 'tenant-1', name: 'Residencial T1' },
    { id: 'p2', company_id: 'tenant-2', name: 'Edifício T2' }
  ]
});
