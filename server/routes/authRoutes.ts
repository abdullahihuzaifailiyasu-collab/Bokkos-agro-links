import { Router } from 'express';
import { authController } from '../controllers/authController.ts';
import { authenticate } from '../middlewares/auth.ts';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/demo-login', authController.demoLogin);
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, authController.updateProfile);

export default router;
