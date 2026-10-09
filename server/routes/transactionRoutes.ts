import { Router } from 'express';
import { transactionController } from '../controllers/transactionController.ts';
import { authenticate } from '../middlewares/auth.ts';

const router = Router();

router.get('/', authenticate, transactionController.getTransactions);
router.get('/:id', authenticate, transactionController.getTransactionById);
router.put('/:id/complete', authenticate, transactionController.completeTransaction);

export default router;
