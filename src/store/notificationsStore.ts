import { create } from 'zustand';
import { Notification } from '../types';
import { MOCK_NOTIFICATIONS } from '../utils/mockData';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;

  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async (_userId) => {
    await new Promise((r) => setTimeout(r, 400));
    const notifs = MOCK_NOTIFICATIONS;
    set({
      notifications: notifs,
      unreadCount: notifs.filter((n) => !n.read).length,
    });
  },

  markAsRead: (notificationId) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  addNotification: (notification) => {
    const newNotif: Notification = {
      ...notification,
      id: `n_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      unreadCount: newNotif.read ? state.unreadCount : state.unreadCount + 1,
    }));
  },
}));
