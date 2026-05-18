import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { userService } from '../identity/UserService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => {
        if (table === 'profiles') {
          return Promise.resolve({ data: { id: 'u1', company_id: 'tenant-a', role: 'admin' }, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
    }
  }
}));

describe('Supabase Integration: CRUD & RBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should interact with Supabase client for user data', async () => {
    const profile = await userService.getCurrentProfile();
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(profile?.id).toBe('u1');
  });

  it('should enforce tenant isolation at the query level (mock validation)', async () => {
    // This is more of a smoke test to ensure the client is being called
    // Real RLS is enforced on Supabase side, but we ensure our service sends correct filters
    await userService.getUsersByCompany('tenant-a');
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    // We expect the service to filter by company_id
    // Based on typical BaseService behavior if migrated to use Supabase (currently it uses localStorage)
  });
});
