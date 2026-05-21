import { SupabaseBaseService } from "../SupabaseBaseService";
import { formatRelativeTime } from "@/utils/formatters";

import { 
  ClientNotification, 
  NotificationType, 
  NOTIFICATION_TEMPLATES,
  NotificationSettings
} from '@/types/clientFlow';

export class NotificationService extends SupabaseBaseService<ClientNotification> {
  constructor() {
    super({ 
      storageKey: "a2_notifications", 
      supabaseTable: "notifications",
      shouldSyncWithSupabase: true,
      fieldMapping: {
        clientId: 'user_id',
        message: 'content',
        read: 'read_at'
      }
    }, []);
  }

  protected mapToSupabase(item: any): any {
    const mapped = super.mapToSupabase(item);
    if (mapped.read_at === true) {
      mapped.read_at = new Date().toISOString();
    } else if (mapped.read_at === false) {
      mapped.read_at = null;
    }
    return mapped;
  }

  protected mapFromSupabase(raw: any): ClientNotification {
    const mapped = super.mapFromSupabase(raw);
    (mapped as any).read = !!raw.read_at;
    return mapped;
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
      read: false,
      urgent: template.urgent,
      metadata,
      company_id: (metadata as any)?.company_id
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
    const unread = this.getUnreadNotifications(clientId);
    for (const n of unread) {
      await this.markAsRead(n.id!);
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
