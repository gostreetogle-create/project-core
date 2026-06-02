import pino from 'pino';
import { env } from '../config/env.js';

/**
 * Единый структурированный логгер.
 * - В development: human-readable (pino-pretty).
 * - В production: JSON (для систем сбора логов).
 *
 * Для тегирования модуля используйте logger.child({ module: 'name' }).
 */
export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  ...(env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
    },
  }),
});
