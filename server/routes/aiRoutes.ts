import { Router } from 'express';
import { aiController } from '../controllers/aiController.ts';

const router = Router();

// Potato tuber and crop health diagnostic inspection
router.post('/inspect-potato', aiController.inspectPotato);

export default router;
