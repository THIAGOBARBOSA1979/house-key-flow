
/**
 * Mock Google Drive Service for development.
 * This should be replaced with a real implementation if needed.
 */
export class GoogleDriveService {
  private static initialized: boolean = false;

  static async initialize() {
    this.initialized = true;
    console.log('[GoogleDriveService] Initialized');
  }

  static async uploadFile(file: File, clientId: string, type: 'warranty' | 'document' | 'inspection') {
    try {
      await this.initialize();
      console.log(`[GoogleDriveService] Mocking upload for ${file.name} (${type})`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        fileId: `mock-file-${crypto.randomUUID()}`,
        viewLink: URL.createObjectURL(file),
      };
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw new Error('Falha ao fazer upload do arquivo');
    }
  }
}

