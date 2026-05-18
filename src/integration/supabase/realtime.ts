import { supabase } from '@/lib/supabase';
import { RealtimeChannel, RealtimePostgresPayload } from '@supabase/supabase-js';

export class SupabaseRealtime {
  static subscribeToTable<T extends { [key: string]: any }>(
    table: string,
    callback: (payload: RealtimePostgresPayload<T>) => void,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*'
  ): RealtimeChannel {
    return supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
        },
        callback
      )
      .subscribe();
  }

  static unsubscribe(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
  }
}
