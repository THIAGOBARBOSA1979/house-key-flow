import { Supabase } from '@/integrations/supabase';
import { errorHandler } from '@/utils/errors/ErrorHandler';

export class InspectionDraftService {
  static async getDraft(inspectionId: string, userId: string) {
    try {
      const { data, error } = await Supabase.db.findMany<any>('inspection_drafts', {
        filters: [
          { column: 'inspection_id', operator: 'eq', value: inspectionId },
          { column: 'user_id', operator: 'eq', value: userId }
        ]
      });

      if (error) throw error;
      return (data && data.length > 0) ? data[0].data : null;
    } catch (err) {
      errorHandler.handle(err, 'InspectionDraftService:getDraft');
      return null;
    }
  }

  static async saveDraft(inspectionId: string, userId: string, data: any) {
    try {
      // Since our abstraction doesn't have an upsert method easily accessible without a conflict constraint
      // and finding if it exists first is safer for our abstraction.
      const existing = await this.getDraft(inspectionId, userId);
      
      if (existing) {
        // We need an ID for update, or we add an updateByFilter to our abstraction.
        // For now, let's use the findOne/update pattern if we can get the ID.
        const { data: records } = await Supabase.db.findMany<any>('inspection_drafts', {
          filters: [
            { column: 'inspection_id', operator: 'eq', value: inspectionId },
            { column: 'user_id', operator: 'eq', value: userId }
          ]
        });
        
        if (records && records[0]) {
          await Supabase.db.update('inspection_drafts', records[0].id, {
            data,
            updated_at: new Date().toISOString()
          });
        }
      } else {
        await Supabase.db.create('inspection_drafts', {
          inspection_id: inspectionId,
          user_id: userId,
          data,
          updated_at: new Date().toISOString()
        });
      }
      return true;
    } catch (err) {
      errorHandler.handle(err, 'InspectionDraftService:saveDraft');
      return false;
    }
  }

  static async clearDraft(inspectionId: string, userId: string) {
    try {
      const { data: records } = await Supabase.db.findMany<any>('inspection_drafts', {
        filters: [
          { column: 'inspection_id', operator: 'eq', value: inspectionId },
          { column: 'user_id', operator: 'eq', value: userId }
        ]
      });
      
      if (records && records[0]) {
        const { error } = await Supabase.db.delete('inspection_drafts', records[0].id);
        if (error) throw error;
      }
      return true;
    } catch (err) {
      errorHandler.handle(err, 'InspectionDraftService:clearDraft');
      return false;
    }
  }
}
