
import { Supabase } from '@/integrations/supabase';
import { errorHandler } from '@/utils/errors/ErrorHandler';

/**
 * Service for file management, integrated with Supabase Storage.
 * Replaces the old mock Google Drive implementation.
 */
export class GoogleDriveService {
  static async uploadFile(file: File, clientId: string, type: 'warranty' | 'document' | 'inspection') {
    try {
      const bucket = type === 'inspection' ? 'inspections-photos' : 'documents';
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${clientId}/${type}/${fileName}`;

      const { data, error } = await Supabase.storage.uploadFile({
        bucket,
        path: filePath,
        file: file
      });

      if (error) throw error;
      
      const publicUrl = await Supabase.storage.getPublicUrl(bucket, filePath);

      return {
        fileId: data?.path,
        viewLink: publicUrl,
      };
    } catch (error) {
      throw errorHandler.handle(error, 'GoogleDriveService:uploadFile');
    }
  }
}


