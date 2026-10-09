import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.ts';
import { authenticate } from '../middlewares/auth.ts';

const router = Router();

router.get('/', authenticate, notificationController.getNotifications);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.put('/read-all', authenticate, notificationController.markAllAsRead);

export default router;
