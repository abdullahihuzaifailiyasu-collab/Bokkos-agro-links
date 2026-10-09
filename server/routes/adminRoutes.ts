import { Router } from 'express';
import { adminController } from '../controllers/adminController.ts';
import { authenticate } from '../middlewares/auth.ts';
import { requireRole } from '../middlewares/rbac.ts';

const router = Router();

// All routes strictly protected by ADMIN role
router.use(authenticate, requireRole(['ADMIN']));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/listings/:id/moderate', adminController.moderateListing);
router.get('/activity-logs', adminController.getActivityLogs);

export default router;
