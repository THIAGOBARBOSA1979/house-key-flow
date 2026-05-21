import { SupabaseBaseService } from "../SupabaseBaseService";
import { formatRelativeTime } from "@/utils/formatters";

import { 
  ClientNotification, 
  NotificationType, 
  NOTIFICATION_TEMPLATES,
  NotificationSettings
} from '@/types/clientFlow';

export class NotificationService extends SupabaseBaseService<ClientNotification> {
  private settingsMap: Map<string, NotificationSettings> = new Map();
  private settingsKey = "a2_notification_settings";

  constructor() {
    super({ 
      storageKey: "a2_notifications", 
      supabaseTable: "notifications",
      shouldSyncWithSupabase: true 
    }, []);
    // this.loadSettings(); // Disabled for DB-first
  }

  private loadSettings() {
    if (typeof window === 'undefined') return;
    const storedSettings = localStorage.getItem(this.settingsKey);
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        Object.entries(parsed).forEach(([clientId, settings]: [string, any]) => {
          this.settingsMap.set(clientId, settings);
        });
      } catch (e) {
        console.error("Failed to load notification settings", e);
      }
    }
  }

  private persistSettings() {
    if (typeof window === 'undefined') return;
    const settingsObj = Object.fromEntries(this.settingsMap.entries());
    localStorage.setItem(this.settingsKey, JSON.stringify(settingsObj));
  }

  async createNotification(
    clientId: string, 
    type: NotificationType,
    metadata?: ClientNotification['metadata'],
    customMessage?: { title?: string; message?: string }
  ): Promise<ClientNotification> {
    const template = NOTIFICATION_TEMPLATES[type];
    
    return await this.create({
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

  async markAsRead(notificationId: string): Promise<boolean> {
    const updated = await this.update(notificationId, { read: true } as any);
    return !!updated;
  }

  async markAllAsRead(clientId: string): Promise<void> {
    const clientNotifs = this.getNotifications(clientId);
    for (const n of clientNotifs) {
      if (!n.read) {
        await this.update(n.id!, { read: true } as any);
      }
    }
  }



  async deleteNotification(notificationId: string): Promise<boolean> {
    return await this.delete(notificationId);
  }


  getRecentNotifications(clientId: string, days: number = 7): ClientNotification[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return this.getNotifications(clientId).filter(n => n.createdAt >= cutoffDate);
  }

  getSettings(clientId: string): NotificationSettings {
    const settings = this.settingsMap.get(clientId);
    if (settings) return settings;
    
    return {
      email: { inspections: true, warranty: true, updates: true, reminders: true },
      sms: { inspections: true, warranty: true, updates: true, reminders: true }
    };
  }

  updateSettings(clientId: string, newSettings: NotificationSettings): void {
    this.settingsMap.set(clientId, newSettings);
    this.persistSettings();
  }

  formatRelativeTime(date: Date): string {
    return formatRelativeTime(date);
  }
}



export const notificationService = new NotificationService();
