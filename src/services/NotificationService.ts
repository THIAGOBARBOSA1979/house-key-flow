
import { 
  ClientNotification, 
  NotificationType, 
  NOTIFICATION_TEMPLATES 
} from '@/types/clientFlow';

// Mock notifications
const mockNotifications: ClientNotification[] = [
  {
    id: 'notif-1',
    clientId: 'client-1',
    type: 'inspection_scheduled',
    title: 'Vistoria de pré-entrega agendada',
    message: 'Sua vistoria foi agendada para 15/05/2025 às 10:00',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    urgent: true,
    metadata: {
      relatedEntityId: 'insp-1',
      relatedEntityType: 'inspection',
      actionUrl: '/client/inspections'
    }
  },
  {
    id: 'notif-2',
    clientId: 'client-1',
    type: 'inspection_enabled',
    title: 'Vistoria Liberada!',
    message: 'Você já pode agendar sua vistoria de pré-entrega.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    urgent: true,
    metadata: {
      relatedEntityType: 'stage',
      actionUrl: '/client/inspections'
    }
  },
  {
    id: 'notif-3',
    clientId: 'client-1',
    type: 'stage_changed',
    title: 'Bem-vindo ao Portal',
    message: 'Seu cadastro foi realizado com sucesso. Em breve sua vistoria será liberada.',
    createdAt: new Date(2024, 10, 20),
    read: true,
    urgent: false,
    metadata: {
      relatedEntityType: 'stage'
    }
  }
];

class NotificationService {
  private notifications: Map<string, ClientNotification[]> = new Map();

  constructor() {
    // Initialize with mock data
    this.notifications.set('client-1', mockNotifications);
  }

  // Create notification
  createNotification(
    clientId: string, 
    type: NotificationType,
    metadata?: ClientNotification['metadata'],
    customMessage?: { title?: string; message?: string }
  ): ClientNotification {
    const template = NOTIFICATION_TEMPLATES[type];
    
    const notification: ClientNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      type,
      title: customMessage?.title || template.title,
      message: customMessage?.message || template.message,
      createdAt: new Date(),
      read: false,
      urgent: template.urgent,
      metadata
    };

    const clientNotifications = this.notifications.get(clientId) || [];
    clientNotifications.unshift(notification); // Add to beginning
    this.notifications.set(clientId, clientNotifications);

    console.log('[NotificationService] Notification created:', notification);

    return notification;
  }

  // Get all notifications for a client
  getNotifications(clientId: string): ClientNotification[] {
    return this.notifications.get(clientId) || [];
  }

  // Get unread notifications
  getUnreadNotifications(clientId: string): ClientNotification[] {
    const notifications = this.notifications.get(clientId) || [];
    return notifications.filter(n => !n.read);
  }

  // Get urgent notifications
  getUrgentNotifications(clientId: string): ClientNotification[] {
    const notifications = this.notifications.get(clientId) || [];
    return notifications.filter(n => n.urgent && !n.read);
  }

  // Get unread count
  getUnreadCount(clientId: string): number {
    return this.getUnreadNotifications(clientId).length;
  }

  // Mark notification as read
  markAsRead(notificationId: string): boolean {
    for (const [clientId, notifications] of this.notifications.entries()) {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        this.notifications.set(clientId, notifications);
        return true;
      }
    }
    return false;
  }

  // Mark all notifications as read
  markAllAsRead(clientId: string): void {
    const notifications = this.notifications.get(clientId) || [];
    notifications.forEach(n => n.read = true);
    this.notifications.set(clientId, notifications);
  }

  // Delete notification
  deleteNotification(notificationId: string): boolean {
    for (const [clientId, notifications] of this.notifications.entries()) {
      const index = notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        notifications.splice(index, 1);
        this.notifications.set(clientId, notifications);
        return true;
      }
    }
    return false;
  }

  // Get notifications by type
  getNotificationsByType(clientId: string, type: NotificationType): ClientNotification[] {
    const notifications = this.notifications.get(clientId) || [];
    return notifications.filter(n => n.type === type);
  }

  // Get recent notifications (last 7 days)
  getRecentNotifications(clientId: string, days: number = 7): ClientNotification[] {
    const notifications = this.notifications.get(clientId) || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return notifications.filter(n => n.createdAt >= cutoffDate);
  }

  // Format relative time
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
