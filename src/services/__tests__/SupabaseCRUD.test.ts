import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { userService } from '../identity/UserService';

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
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    }
  }
}));

// Mock the internal Supabase helper used by UserService
vi.mock('@/integrations/supabase', () => ({
  Supabase: {
    db: {
      findMany: vi.fn().mockResolvedValue({ data: [], error: null }),
      create: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn().mockResolvedValue({ data: {}, error: null }),
      delete: vi.fn().mockResolvedValue({ data: true, error: null }),
    }
  }
}));

vi.mock('@/integrations/supabase/realtime', () => ({
  SupabaseRealtime: {
    subscribeToTable: vi.fn()
  }
}));

describe('Supabase Sync: User Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (userService as any).items = [];
  });

  it('should create a user and sync to Supabase', async () => {
    const newUser = userService.create({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active'
    }, 'company-1');

    expect(newUser.id).toBeDefined();
    // The create method calls Supabase.db.create in the background
    // Since it's background/async in the source, we might need a small wait or just check if it was called
    const { Supabase } = await import('@/integrations/supabase');
    expect(Supabase.db.create).toHaveBeenCalled();
  });

  it('should update a user and sync to Supabase', async () => {
    const user = userService.create({
      name: 'Old Name',
      email: 'old@example.com',
      role: 'client',
      status: 'active'
    });

    userService.update(user.id, { name: 'New Name' });
    
    const { Supabase } = await import('@/integrations/supabase');
    expect(Supabase.db.update).toHaveBeenCalledWith('profiles', user.id, expect.objectContaining({
      full_name: 'New Name'
    }));
  });
});

