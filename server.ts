import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/authRoutes.ts';
import produceRoutes from './server/routes/produceRoutes.ts';
import requestRoutes from './server/routes/requestRoutes.ts';
import transactionRoutes from './server/routes/transactionRoutes.ts';
import notificationRoutes from './server/routes/notificationRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import aiRoutes from './server/routes/aiRoutes.ts';
import paymentRoutes from './server/routes/paymentRoutes.ts';
import smsRoutes from './server/routes/smsRoutes.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON Body Parser with 10MB limit (for base64 produce photos)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Bokkos AgroLink API',
      timestamp: new Date().toISOString(),
      location: 'Bokkos LGA, Plateau State, Nigeria',
    });
  });

  // Mount API Endpoints FIRST
  app.use('/api/auth', authRoutes);
  app.use('/api/produce', produceRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/sms', smsRoutes);

  // Fallback for unmatched API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
    });
  });

  // Vite Middleware Setup for Frontend SPA
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Bokkos AgroLink] Full-stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Bokkos AgroLink] Failed to start server:', err);
  process.exit(1);
});
