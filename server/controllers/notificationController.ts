import { Request, Response } from 'express';
import { db } from '../db/store.ts';

export const notificationController = {
  // GET /api/notifications
  getNotifications(req: Request, res: Response): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const userNotifs = Array.from(db.notifications.values())
        .filter((n) => n.userId === req.user!.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const unreadCount = userNotifs.filter((n) => !n.isRead).length;

      res.json({
        success: true,
        unreadCount,
        notifications: userNotifs,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notifications: ' + (err.message || 'Unknown'),
      });
    }
  },

  // PUT /api/notifications/:id/read
  markAsRead(req: Request, res: Response): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { id } = req.params;
      const notif = db.notifications.get(id);

      if (!notif || notif.userId !== req.user.id) {
        res.status(404).json({ success: false, message: 'Notification not found.' });
        return;
      }

      notif.isRead = true;
      db.notifications.set(id, notif);

      res.json({ success: true, notification: notif });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update notification: ' + (err.message || 'Unknown'),
      });
    }
  },

  // PUT /api/notifications/read-all
  markAllAsRead(req: Request, res: Response): void {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      for (const notif of db.notifications.values()) {
        if (notif.userId === req.user.id && !notif.isRead) {
          notif.isRead = true;
          db.notifications.set(notif.id, notif);
        }
      }

      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update notifications: ' + (err.message || 'Unknown'),
      });
    }
  },
};
