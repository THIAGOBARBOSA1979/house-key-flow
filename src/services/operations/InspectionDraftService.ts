import { Supabase } from '@/integrations/supabase';
import { errorHandler } from '@/utils/errors/ErrorHandler';

export class InspectionDraftService {
  static async getDraft(inspectionId: string, userId: string) {
    try {
      const { data, error } = await Supabase.client
        .from('inspection_drafts')
        .select('data')
        .eq('inspection_id', inspectionId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data?.data || null;
    } catch (err) {
      errorHandler.handle(err, 'InspectionDraftService:getDraft');
      return null;
    }
  }

  static async saveDraft(inspectionId: string, userId: string, data: any) {
    try {
      const { error } = await Supabase.client
        .from('inspection_drafts')
        .upsert({
          inspection_id: inspectionId,
          user_id: userId,
          data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'inspection_id,user_id'
        });

      if (error) throw error;
      return true;
    } catch (err) {
      errorHandler.handle(err, 'InspectionDraftService:saveDraft');
      return false;
    }
  }

  static async clearDraft(inspectionId: string, userId: string) {
    try {
      const { error } = await Supabase.client
        .from('inspection_drafts')
        .delete()
        .eq('inspection_id', inspectionId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (err) {
      errorHandler.handle(err, 'InspectionDraftService:clearDraft');
      return false;
    }
  }
}
