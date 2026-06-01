// ========================================
// Backend Entry Point
// ========================================

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import authRoutes from './modules/auth.routes.js';
import { User } from './modules/user.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Static files (uploads)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Routes
app.use('/api/v1/auth', authRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start
async function start() {
  await connectDB();

  // Создаём admin по умолчанию, если нет пользователей
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create({
      username: 'admin',
      password: 'admin123',
      displayName: 'Администратор',
      email: 'admin@project-core.local',
      role: 'admin',
      permissions: ['*']
    });
    console.log('[SEED] Admin user created (admin / admin123)');
  }

  app.listen(env.PORT, () => {
    console.log(`[SERVER] Running on http://localhost:${env.PORT}`);
    console.log(`[SERVER] Environment: ${env.NODE_ENV}`);
  });
}

start();
