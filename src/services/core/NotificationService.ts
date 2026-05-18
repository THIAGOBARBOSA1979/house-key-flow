import { BaseService } from "../BaseService";
import { 
  ClientNotification, 
  NotificationType, 
  NOTIFICATION_TEMPLATES,
  NotificationSettings
} from '@/types/clientFlow';

class NotificationService extends BaseService<ClientNotification> {
  private settings: Map<string, NotificationSettings> = new Map();
  private settingsKey = "a2_notification_settings";

  constructor() {
    super("a2_notifications", []);
    this.loadSettings();
    
    // Initialize with mock data if empty
    if (this.items.length === 0) {
      const defaultSettings: NotificationSettings = {
        email: { inspections: true, warranty: true, updates: true, reminders: true },
        sms: { inspections: true, warranty: true, updates: true, reminders: true }
      };
      this.settings.set('client-1', defaultSettings);
      this.settings.set('2', defaultSettings);
      
      this.create({
        clientId: '2',
        type: 'stage_changed',
        title: 'Bem-vindo ao Portal',
        message: 'Seu acesso foi liberado com sucesso!',
        createdAt: new Date(),
        read: false,
        urgent: false,
        metadata: { relatedEntityType: 'stage' }
      } as any);
      
      this.persistSettings();
    }
  }

  private loadSettings() {
    if (typeof window === 'undefined') return;
    const storedSettings = localStorage.getItem(this.settingsKey);
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        Object.entries(parsed).forEach(([clientId, settings]: [string, any]) => {
          this.settings.set(clientId, settings);
        });
      } catch (e) {
        console.error("Failed to load notification settings", e);
      }
    }
  }

  private persistSettings() {
    if (typeof window === 'undefined') return;
    const settingsObj = Object.fromEntries(this.settings.entries());
    localStorage.setItem(this.settingsKey, JSON.stringify(settingsObj));
  }

  createNotification(
    clientId: string, 
    type: NotificationType,
    metadata?: ClientNotification['metadata'],
    customMessage?: { title?: string; message?: string }
  ): ClientNotification {
    const template = NOTIFICATION_TEMPLATES[type];
    
    return this.create({
      clientId,
      type,
      title: customMessage?.title || template.title,
      message: customMessage?.message || template.message,
      createdAt: new Date(),
      read: false,
      urgent: template.urgent,
      metadata
    } as any);
  }

  getNotifications(clientId: string): ClientNotification[] {
    return this.items.filter(n => n.clientId === clientId);
  }

  getUnreadNotifications(clientId: string): ClientNotification[] {
    return this.getNotifications(clientId).filter(n => !n.read);
  }

  getUrgentNotifications(clientId: string): ClientNotification[] {
    return this.getNotifications(clientId).filter(n => n.urgent && !n.read);
  }

  getUnreadCount(clientId: string): number {
    return this.getUnreadNotifications(clientId).length;
  }

  markAsRead(notificationId: string): boolean {
    const updated = this.update(notificationId, { read: true } as any);
    return !!updated;
  }

  markAllAsRead(clientId: string): void {
    const clientNotifs = this.getNotifications(clientId);
    clientNotifs.forEach(n => {
      if (!n.read) this.update(n.id!, { read: true } as any);
    });
  }

  deleteNotification(notificationId: string): boolean {
    return this.delete(notificationId);
  }

  getRecentNotifications(clientId: string, days: number = 7): ClientNotification[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return this.getNotifications(clientId).filter(n => n.createdAt >= cutoffDate);
  }

  getSettings(clientId: string): NotificationSettings {
    const settings = this.settings.get(clientId);
    if (settings) return settings;
    
    return {
      email: { inspections: true, warranty: true, updates: true, reminders: true },
      sms: { inspections: true, warranty: true, updates: true, reminders: true }
    };
  }

  updateSettings(clientId: string, newSettings: NotificationSettings): void {
    this.settings.set(clientId, newSettings);
    this.persistSettings();
  }

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
    if (diffInHours < 24) return `Há ${diffInHours}h`;
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `Há ${diffInDays} dias`;
    
    return date.toLocaleDateString('pt-BR');
  }
}

export const notificationService = new NotificationService();

