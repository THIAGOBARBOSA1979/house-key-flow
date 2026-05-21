import { io, Socket } from 'socket.io-client';
import { toast } from '@/components/ui/use-toast';
import { errorHandler } from '@/utils/errors/ErrorHandler';

interface TicketUpdateData {
  id: string;
  status: string;
}

interface NotificationData {
  title: string;
  message: string;
}

export class SyncService {
  private static socket: Socket | null = null;
  private static retryAttempts = 3;
  private static retryDelay = 1000;
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) return;

    console.log('SyncService: Inicializando...');
    
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiUrl) {
      console.warn('SyncService: VITE_API_URL não configurado. Pulando inicialização do socket.');
      this.isInitialized = true;
      return;
    }

    try {
      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io(apiUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        timeout: 5000,
      });

      this.setupEventListeners();
      this.isInitialized = true;
      console.log('SyncService: Inicializado com sucesso');
    } catch (error) {
      errorHandler.handle(error, 'SyncService:initialize');
      this.isInitialized = true;
    }
  }

  private static setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('SyncService: Conectado ao servidor');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.log('SyncService: Erro de conexão:', error.message);
    });

    this.socket.on('notification', (data: NotificationData) => {
      toast({
        title: data.title,
        description: data.message,
      });
    });

    this.socket.on('ticket_update', (data: TicketUpdateData) => {
      toast({
        title: "Atualização de Chamado",
        description: `O chamado #${data.id} foi atualizado para: ${data.status}`,
      });
      window.dispatchEvent(new CustomEvent('ticket_update', { detail: data }));
    });

    this.socket.on('warranty_update', (data: Record<string, unknown>) => {
      window.dispatchEvent(new CustomEvent('warranty_update', { detail: data }));
    });

    this.socket.on('inspection_update', (data: Record<string, unknown>) => {
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

