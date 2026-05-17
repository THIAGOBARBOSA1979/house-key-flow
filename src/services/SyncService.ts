
import { io } from 'socket.io-client';
import { toast } from '@/components/ui/use-toast';

export class SyncService {
  private static socket: any;
  private static retryAttempts = 3;
  private static retryDelay = 1000;
  private static isInitialized = false;

  static initialize() {
    console.log('SyncService: Inicializando...');
    
    // Check if we have the required environment variable
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiUrl) {
      console.warn('SyncService: VITE_API_URL não configurado. Pulando inicialização do socket.');
      this.isInitialized = true;
      return;
    }

    try {
      console.log('SyncService: Conectando ao socket:', apiUrl);
      this.socket = io(apiUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        timeout: 5000,
      });

      this.setupEventListeners();
      this.isInitialized = true;
      console.log('SyncService: Inicializado com sucesso');
    } catch (error) {
      console.error('SyncService: Erro na inicialização:', error);
      this.isInitialized = true; // Mark as initialized even if failed to prevent crashes
    }
  }

  private static setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('SyncService: Conectado ao servidor');
    });

    this.socket.on('connect_error', (error: any) => {
      console.log('SyncService: Erro de conexão:', error.message);
    });

    this.socket.on('notification', (data: any) => {
      toast({
        title: data.title,
        description: data.message,
      });
    });

    this.socket.on('ticket_update', (data: any) => {
      toast({
        title: "Atualização de Chamado",
        description: `O chamado #${data.id} foi atualizado para: ${data.status}`,
      });
      window.dispatchEvent(new CustomEvent('ticket_update', { detail: data }));
    });

    this.socket.on('warranty_update', (data: any) => {
      // Dispatch warranty update event
      window.dispatchEvent(new CustomEvent('warranty_update', { detail: data }));
    });

    this.socket.on('inspection_update', (data: any) => {
      // Dispatch inspection update event
      window.dispatchEvent(new CustomEvent('inspection_update', { detail: data }));
    });
  }

  static async syncData<T>(endpoint: string, data: T, method: string = 'POST'): Promise<T> {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiUrl) {
      console.warn('SyncService: VITE_API_URL não configurado. Retornando dados localmente.');
      return data;
    }

    let attempt = 0;
    while (attempt < this.retryAttempts) {
      try {
        console.log(`SyncService: Tentativa ${attempt + 1} de sincronização para ${endpoint}`);
        
        const response = await fetch(`${apiUrl}/${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: method !== 'GET' ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
          throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('SyncService: Sincronização bem-sucedida');
        return result;
      } catch (error) {
        attempt++;
        console.error(`SyncService: Erro na tentativa ${attempt}:`, error);
        
        if (attempt === this.retryAttempts) {
          console.error('SyncService: Máximo de tentativas atingido');
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
    throw new Error('Max retry attempts reached');
  }

  static isConnected(): boolean {
    return this.socket?.connected || false;
  }

  static getStatus(): 'connected' | 'disconnected' | 'not_configured' {
    if (!import.meta.env.VITE_API_URL) return 'not_configured';
    return this.socket?.connected ? 'connected' : 'disconnected';
  }
}
