import express from 'express';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import threadRoutes from './routes/threadRoutes.js';
import postRoutes from './routes/postRoutes.js';
import sourceWeightRoutes from './routes/sourceWeightRoutes.js';
import docsRoutes from './routes/docsRoutes.js';
import publicDocsRoutes from './routes/publicDocsRoutes.js';

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
  app.use('/api/admin/docs', docsRoutes);
  app.use('/api/docs', publicDocsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}