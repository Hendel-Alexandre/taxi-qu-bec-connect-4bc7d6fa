import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, AlertCircle, Info, Car } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean | null;
  created_at: string | null;
}

const notificationIcons: Record<string, LucideIcon> = {
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
  ride: Car,
};

const notificationColors: Record<string, string> = {
  success: 'bg-green-50 text-green-600 border-green-100',
  warning: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  info: 'bg-blue-50 text-blue-600 border-blue-100',
  ride: 'bg-primary/10 text-primary border-primary/20',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ));
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id);
    
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-CA');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm font-medium">
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes lues'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Tout marquer comme lu
          </button>
        )}
      </header>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="divide-y divide-border">
          {notifications.map((notification, index) => {
            const Icon = notificationIcons[notification.type || 'info'] || Info;
            const colorClass = notificationColors[notification.type || 'info'] || notificationColors.info;
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => markAsRead(notification.id)}
                className={`p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                  !notification.is_read ? 'bg-muted/50' : 'hover:bg-muted/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-bold text-sm ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                )}
              </motion.div>
            );
          })}

          {notifications.length === 0 && (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-1 text-foreground">Aucune notification</h3>
              <p className="text-muted-foreground text-sm">
                Vous n'avez pas encore de notifications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
