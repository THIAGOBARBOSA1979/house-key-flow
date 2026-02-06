
import { useState, useEffect, useCallback } from 'react';
import { ClientNotification, NotificationType } from '@/types/clientFlow';
import { notificationService } from '@/services/NotificationService';

export interface UseNotificationsResult {
  notifications: ClientNotification[];
  unreadNotifications: ClientNotification[];
  urgentNotifications: ClientNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  refresh: () => void;
  formatRelativeTime: (date: Date) => string;
}

export function useNotifications(clientId: string): UseNotificationsResult {
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(() => {
    setIsLoading(true);
    const clientNotifications = notificationService.getNotifications(clientId);
    setNotifications(clientNotifications);
    setIsLoading(false);
  }, [clientId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadNotifications = notifications.filter(n => !n.read);
  const urgentNotifications = notifications.filter(n => n.urgent && !n.read);
  const unreadCount = unreadNotifications.length;

  const markAsRead = useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId);
    loadNotifications();
  }, [loadNotifications]);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead(clientId);
    loadNotifications();
  }, [clientId, loadNotifications]);

  const deleteNotification = useCallback((notificationId: string) => {
    notificationService.deleteNotification(notificationId);
    loadNotifications();
  }, [loadNotifications]);

  const formatRelativeTime = useCallback((date: Date) => {
    return notificationService.formatRelativeTime(date);
  }, []);

  return {
    notifications,
    unreadNotifications,
    urgentNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: loadNotifications,
    formatRelativeTime
  };
}
