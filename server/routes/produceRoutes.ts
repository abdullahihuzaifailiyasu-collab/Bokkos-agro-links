import { Router } from 'express';
import { produceController } from '../controllers/produceController.ts';
import { authenticate } from '../middlewares/auth.ts';
import { requireRole } from '../middlewares/rbac.ts';

const router = Router();

// Publicly readable listings (with optional filtering)
router.get('/', produceController.getListings);
router.get('/:id', produceController.getListingById);

// Farmer only actions
router.post('/', authenticate, requireRole(['FARMER']), produceController.createListing);
router.put('/:id', authenticate, produceController.updateListing);
router.delete('/:id', authenticate, produceController.deleteListing);

export default router;
