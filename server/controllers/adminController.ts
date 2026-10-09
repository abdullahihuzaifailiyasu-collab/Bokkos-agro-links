import { Request, Response } from 'express';
import { db } from '../db/store.ts';

export const adminController = {
  // GET /api/admin/stats
  getStats(req: Request, res: Response): void {
    try {
      const stats = db.getAdminStats();
      res.json({
        success: true,
        stats,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve admin stats: ' + (err.message || 'Unknown'),
      });
    }
  },

  // GET /api/admin/users
  getUsers(req: Request, res: Response): void {
    try {
      const { role, status, q } = req.query;
      let users = Array.from(db.users.values()).map(({ passwordHash, ...safeUser }) => safeUser);

      if (role && typeof role === 'string' && role !== 'ALL') {
        users = users.filter((u) => u.role === role);
      }

      if (status && typeof status === 'string' && status !== 'ALL') {
        users = users.filter((u) => u.status === status);
      }

      if (q && typeof q === 'string' && q.trim().length > 0) {
        const query = q.trim().toLowerCase();
        users = users.filter((u) =>
          u.fullName.toLowerCase().includes(query) ||
          u.phoneNumber.includes(query) ||
          (u.email && u.email.toLowerCase().includes(query)) ||
          (u.farmerProfile?.wardLocation && u.farmerProfile.wardLocation.toLowerCase().includes(query)) ||
          (u.buyerProfile?.operatingCity && u.buyerProfile.operatingCity.toLowerCase().includes(query))
        );
      }

      users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json({
        success: true,
        count: users.length,
        users,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users: ' + (err.message || 'Unknown'),
      });
    }
  },

  // PUT /api/admin/users/:id/status
  updateUserStatus(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (status !== 'ACTIVE' && status !== 'SUSPENDED') {
        res.status(400).json({ success: false, message: 'Status must be ACTIVE or SUSPENDED.' });
        return;
      }

      const user = db.users.get(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      if (user.role === 'ADMIN') {
        res.status(400).json({ success: false, message: 'Admin accounts cannot be suspended via this panel.' });
        return;
      }

      user.status = status;
      user.updatedAt = new Date().toISOString();
      db.users.set(id, user);

      db.logActivity({
        actorId: req.user?.id,
        actorName: req.user?.fullName || 'Admin',
        actorRole: 'ADMIN',
        action: status === 'SUSPENDED' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
        targetEntity: 'USER',
        targetId: id,
        details: `${req.user?.fullName || 'Admin'} changed account status of ${user.fullName} (${user.role}) to ${status}`,
      });

      const { passwordHash: _, ...safeUser } = user;
      res.json({
        success: true,
        message: `User account has been ${status.toLowerCase()}.`,
        user: safeUser,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update user status: ' + (err.message || 'Unknown'),
      });
    }
  },

  // PUT /api/admin/listings/:id/moderate
  moderateListing(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const listing = db.listings.get(id);
      if (!listing) {
        res.status(404).json({ success: false, message: 'Listing not found.' });
        return;
      }

      listing.status = status;
      listing.updatedAt = new Date().toISOString();
      db.listings.set(id, listing);

      // Notify the farmer
      db.createNotification({
        userId: listing.farmerId,
        title: 'Listing Moderated by Admin',
        message: `Your listing for ${listing.variety} was set to ${status}. Reason: ${reason || 'Administrative review'}`,
        type: 'SYSTEM',
        linkUrl: '/farmer/produce',
      });

      db.logActivity({
        actorId: req.user?.id,
        actorName: req.user?.fullName || 'Admin',
        actorRole: 'ADMIN',
        action: 'LISTING_MODERATED',
        targetEntity: 'PRODUCE_LISTING',
        targetId: id,
        details: `Listing status set to ${status}. Reason: ${reason || 'None provided'}`,
      });

      res.json({
        success: true,
        message: `Listing status updated to ${status}.`,
        listing,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to moderate listing: ' + (err.message || 'Unknown'),
      });
    }
  },

  // GET /api/admin/activity-logs
  getActivityLogs(req: Request, res: Response): void {
    try {
      res.json({
        success: true,
        count: db.activityLogs.length,
        logs: db.activityLogs,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve activity logs: ' + (err.message || 'Unknown'),
      });
    }
  },
};
