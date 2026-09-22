import express from 'express';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import threadRoutes from './routes/threadRoutes.js';
import postRoutes from './routes/postRoutes.js';
import sourceWeightRoutes from './routes/sourceWeightRoutes.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/threads', threadRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/source-weights', sourceWeightRoutes);
  // Las rutas de moderación se montan más adelante (Fase 7).

  app.use(notFound);
  app.use(errorHandler);

  return app;
}