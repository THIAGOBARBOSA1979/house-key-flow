import { SupabaseBaseService } from "../SupabaseBaseService";
import { formatRelativeTime } from "@/utils/formatters";

import { 
  ClientNotification, 
  NotificationType, 
  NOTIFICATION_TEMPLATES,
  NotificationSettings
} from '@/types/clientFlow';

export class NotificationService extends SupabaseBaseService<ClientNotification> {
  // private settingsMap: Map<string, NotificationSettings> = new Map();
  // private settingsKey = "a2_notification_settings";

  constructor() {
    super({ 
      storageKey: "a2_notifications", 
      supabaseTable: "notifications",
      shouldSyncWithSupabase: true 
    }, []);
    // this.loadSettings(); // Disabled for DB-first
  }

  private loadSettings() {
    // Disabled
  }

  private persistSettings() {
    // Disabled
  }

  async createNotification(
    clientId: string, 
    type: NotificationType,
    metadata?: ClientNotification['metadata'],
    customMessage?: { title?: string; message?: string }
  ): Promise<ClientNotification> {
    const template = NOTIFICATION_TEMPLATES[type];
    
    return await this.create({
      user_id: clientId,
      type,
      title: customMessage?.title || template.title,
      content: customMessage?.message || template.message,
      read_at: null,
      metadata
    } as any);

  }


  getNotifications(clientId: string): ClientNotification[] {
    return this.items.filter(n => (n as any).user_id === clientId || n.clientId === clientId);
  }

  getUnreadNotifications(clientId: string): ClientNotification[] {
    return this.getNotifications(clientId).filter(n => !(n as any).read_at && !n.read);
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
    return {
      email: { inspections: true, warranty: true, updates: true, reminders: true },
      sms: { inspections: true, warranty: true, updates: true, reminders: true }
    };
  }

  updateSettings(clientId: string, newSettings: NotificationSettings): void {
    // In a real scenario, this would persist to a 'user_settings' or 'profiles' table
  }

  formatRelativeTime(date: Date): string {
    return formatRelativeTime(date);
  }
}



export const notificationService = new NotificationService();
