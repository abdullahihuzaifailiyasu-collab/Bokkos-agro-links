import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.ts';

const router = Router();

router.post('/initialize', paymentController.initializePayment);
router.get('/verify/:reference', paymentController.verifyPayment);
router.post('/complete', paymentController.completePayment);

export default router;
