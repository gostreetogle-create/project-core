// ========================================
// Auth Module — регистрация, вход, обновление токена
// ========================================

import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../modules/user.model.js';
import { env } from '../config/env.js';
import { success, error } from '../utils/api-response.js';
import { AppError } from '../middleware/error-handler.js';
import { authMiddleware, JwtPayload } from '../middleware/auth.js';

const router = Router();

// POST /auth/login
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Введите имя пользователя'),
  body('password').notEmpty().withMessage('Введите пароль')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array().map(e => e.msg).join('; '));
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase(), isActive: true });
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Неверный логин или пароль', 401);
    }

    const payload: JwtPayload = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      permissions: user.permissions
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
    const refreshToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);

    res.json(success({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        permissions: user.permissions
      },
      accessToken,
      refreshToken
    }));
  } catch (err) {
    next(err);
  }
});

// POST /auth/refresh
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Требуется refreshToken')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError('Пользователь не найден', 401);
    }

    const payload: JwtPayload = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      permissions: user.permissions
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
    const newRefreshToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);

    res.json(success({ accessToken, refreshToken: newRefreshToken }));
  } catch (err) {
    next(err instanceof AppError ? err : new AppError('Недействительный refreshToken', 401));
  }
});

// GET /auth/me — текущий пользователь
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) throw new AppError('Пользователь не найден', 404);
    res.json(success({
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    }));
  } catch (err) {
    next(err);
  }
});

export default router;
