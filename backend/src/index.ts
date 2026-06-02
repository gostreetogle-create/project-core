// ========================================
// Backend Entry Point
// ========================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { logger } from './utils/logger.js';
import { setupSwagger } from './docs/swagger.js';
import authRoutes from './modules/auth.routes.js';
import { User } from './modules/user.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const log = logger.child({ module: 'server' });

// Security middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10,                   // не больше 10 запросов за окно
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, message: 'Слишком много запросов. Попробуйте позже.' },
});

// Static files (uploads)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Routes
app.use('/api/v1/auth', authLimiter, authRoutes);

// Swagger docs
setupSwagger(app);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start
let dbConnected = false;

async function start() {
  // Пробуем подключиться к MongoDB, но не падаем если недоступна
  try {
    await connectDB();
    dbConnected = true;

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
      logger.child({ module: 'seed' }).info('Admin user created (admin / admin123)');
    }
  } catch (err) {
    log.warn(err, 'MongoDB unavailable — running without database. Auth and CRUD endpoints will return 503.');
  }

  const server = app.listen(env.PORT, () => {
    log.info(`Running on http://localhost:${env.PORT}`);
    log.info(`Environment: ${env.NODE_ENV}`);
    if (!dbConnected) log.warn('MongoDB: DISCONNECTED');
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    log.warn(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      if (dbConnected) await disconnectDB();
      log.info('Shut down complete.');
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
