import { Router } from 'express';
import { requestController } from '../controllers/requestController.ts';
import { authenticate } from '../middlewares/auth.ts';
import { requireRole } from '../middlewares/rbac.ts';

const router = Router();

// Buyer creates purchase request
router.post('/', authenticate, requireRole(['BUYER']), requestController.createRequest);

// List requests for authenticated user (farmer sees incoming, buyer sees outgoing, admin sees all)
router.get('/', authenticate, requestController.getRequests);

// Farmer accept/reject or Buyer cancel
router.put('/:id/status', authenticate, requestController.updateRequestStatus);

export default router;
