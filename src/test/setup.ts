import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia which is not available in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// Mock ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

import { simulator } from './supabase-simulator';

// Advanced Supabase Simulation Layer
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => simulator.getBuilder(table)),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ 
        data: { user: { id: 'u1', email: 'test@example.com' }, session: { access_token: 'fake' } }, 
        error: null 
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    rpc: vi.fn((fn, params) => simulator.getBuilder('rpc').rpc(fn, params))
  }
}));

// Mock the internal Supabase helper to use the simulator
vi.mock('@/integration/supabase', () => ({
  Supabase: {
    db: {
      findMany: vi.fn(async (table, options) => {
        const builder = simulator.getBuilder(table);
        if (options?.filters) {
          options.filters.forEach((f: any) => {
            if (f.operator === 'eq') builder.eq(f.column, f.value);
            if (f.operator === 'in') builder.in(f.column, f.value);
          });
        }
        if (options?.pagination) {
          const from = (options.pagination.page - 1) * options.pagination.pageSize;
          const to = from + options.pagination.pageSize - 1;
          builder.range(from, to);
        }
        const { data } = await builder;
        return { data, error: null };
      }),
      findOne: vi.fn((table, id) => simulator.getBuilder(table).eq('id', id).single()),
      create: vi.fn((table, data) => simulator.getBuilder(table).insert(data)),
      update: vi.fn((table, id, data) => simulator.getBuilder(table).eq('id', id).update(data)),
      delete: vi.fn((table, id) => simulator.getBuilder(table).eq('id', id).delete()),
      rpc: vi.fn((fn, params) => simulator.getBuilder('rpc').rpc(fn, params)),
    },
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ 
        user: { id: 'u1', full_name: 'Simulated User', role: 'admin' }, 
        error: null 
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getCurrentUser: vi.fn().mockResolvedValue({ 
        id: 'u1', 
        full_name: 'Simulated User', 
        role: 'admin',
        company_id: 'tenant-1'
      }),
    }
  }
}));



// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: 'pt-BR',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

vi.mock('@/integration/supabase/realtime', () => ({
  SupabaseRealtime: {
    subscribeToTable: vi.fn(),
    unsubscribe: vi.fn()
  }
}));



