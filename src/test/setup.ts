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

// Mock Supabase to avoid infinite recursion or actual network calls in tests
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ 
        data: { user: { id: 'admin-1', email: 'admin@exemplo.com' }, session: { access_token: 'fake-token' } }, 
        error: null 
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    }
  }
}));

// Mock the internal Supabase helper
vi.mock('@/integration/supabase', () => ({
  Supabase: {
    db: {
      findMany: vi.fn().mockResolvedValue({ data: [], error: null }),
      create: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn().mockResolvedValue({ data: {}, error: null }),
      delete: vi.fn().mockResolvedValue({ data: true, error: null }),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ 
        user: { id: 'admin-1', email: 'admin@exemplo.com', full_name: 'Administrador', role: 'admin' }, 
        error: null 
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getCurrentUser: vi.fn().mockResolvedValue({ 
        id: 'admin-1', 
        full_name: 'Administrador', 
        role: 'admin',
        company_id: 'comp-1'
      }),
    }
  }
}));

vi.mock('@/integration/supabase/realtime', () => ({
  SupabaseRealtime: {
    subscribeToTable: vi.fn(),
    unsubscribe: vi.fn()
  }
}));


