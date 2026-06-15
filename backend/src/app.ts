import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import storeRoutes from './routes/store.routes';
import ratingRoutes from './routes/rating.routes';
import { notFound, errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json());
  if (env.nodeEnv !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/stores', storeRoutes);
  app.use('/api/ratings', ratingRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
