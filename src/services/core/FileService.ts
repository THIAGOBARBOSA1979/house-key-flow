import { Supabase } from '@/integrations/supabase';
import { errorHandler } from '@/utils/errors/ErrorHandler';

export class FileService {
  static async uploadInspectionPhoto(file: File, companyId: string, inspectionId: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${companyId}/${inspectionId}/${fileName}`;

    try {
      const { data, error } = await Supabase.storage.uploadFile({
        bucket: 'inspections-photos',
        path: filePath,
        file: file,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

      if (error) throw error;
      
      return await Supabase.storage.getPublicUrl('inspections-photos', filePath);
    } catch (err) {
      errorHandler.handle(err, 'FileService:uploadInspectionPhoto');
      return null;
    }
  }

  static async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await Supabase.storage.deleteFile(bucket, path);
      if (error) throw error;
      return true;
    } catch (err) {
      errorHandler.handle(err, 'FileService:deleteFile');
      return false;
    }
  }
}
