import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

// Mock notifications for demonstration
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'POA&M Due Soon',
    message: 'POA&M POAM-001 (Implement Multi-Factor Authentication) is due in 3 days',
    type: 'warning',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    actionUrl: '/poam',
    actionText: 'View POA&M'
  },
  {
    id: 'notif-2',
    title: 'Compliance Assessment Complete',
    message: 'Automated compliance assessment has completed. 15 new controls require attention.',
    type: 'info',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: false,
    actionUrl: '/nist',
    actionText: 'Review Controls'
  },
  {
    id: 'notif-3',
    title: 'Data Sync Successful',
    message: 'Azure Function data synchronization completed successfully.',
    type: 'success',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: true,
    actionUrl: '/monitoring',
    actionText: 'View Details'
  },
  {
    id: 'notif-4',
    title: 'Critical Control Failed',
    message: 'Control AC-2 (Account Management) assessment failed. Immediate attention required.',
    type: 'error',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    read: false,
    actionUrl: '/nist?control=AC-2',
    actionText: 'Review Control'
  }
];

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: mockNotifications,
  
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      read: false
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }));
  },
  
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    }));
  },
  
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notif) => ({ ...notif, read: true }))
    }));
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notif) => notif.id !== id)
    }));
  },
  
  clearAll: () => {
    set({ notifications: [] });
  },
  
  getUnreadCount: () => {
    return get().notifications.filter((notif) => !notif.read).length;
  }
}));
