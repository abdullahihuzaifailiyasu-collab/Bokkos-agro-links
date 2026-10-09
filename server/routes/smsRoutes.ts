import { Router } from 'express';
import { smsController } from '../controllers/smsController.ts';

const router = Router();

router.post('/send', smsController.sendSms);
router.get('/logs', smsController.getSmsLogs);
router.post('/template-alert', smsController.sendTemplateAlert);

export default router;
