import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const dbLog = logger.child({ module: 'db' });

export async function connectDB(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
  dbLog.info('MongoDB connected');

  mongoose.connection.on('error', (err) => {
    dbLog.error(err, 'MongoDB runtime error');
  });

  mongoose.connection.on('disconnected', () => {
    dbLog.warn('MongoDB disconnected');
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  dbLog.info('MongoDB disconnected (clean)');
}
