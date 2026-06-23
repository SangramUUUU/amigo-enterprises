'use client';

import { useEffect, useState } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { api } from '@/lib/api';
import type { Notification } from '@/lib/types';

export default function NotificationBell() {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [count, setCount] = useState(0);

  const load = async () => {
    try {
      const [list, unread] = await Promise.all([
        api<{ notifications: Notification[] }>('/notifications?unread_only=true'),
        api<{ count: number }>('/notifications/unread-count'),
      ]);
      setNotifications(list.notifications);
      setCount(unread.count);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id: string) => {
    await api(`/notifications/${id}/read`, { method: 'PATCH' });
    load();
  };

  return (
    <>
      <IconButton color="default" onClick={(e) => { setAnchor(e.currentTarget); load(); }}>
        <Badge badgeContent={count} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {notifications.length === 0 ? (
          <MenuItem disabled>No new notifications</MenuItem>
        ) : (
          notifications.map((n) => (
            <MenuItem key={n.id} onClick={() => { markRead(n.id); setAnchor(null); }}>
              <Box>
                <Typography variant="subtitle2">{n.title}</Typography>
                <Typography variant="body2" color="text.secondary">{n.message}</Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
