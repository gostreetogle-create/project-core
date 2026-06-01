// ========================================
// CRUD Factory — универсальная фабрика для всех сущностей
// ========================================

import { Router, Request, Response, NextFunction } from 'express';
import { Model, Document, FilterQuery, SortOrder } from 'mongoose';
import { validationResult, ValidationChain } from 'express-validator';
import { success, paginated, error } from '../utils/api-response.js';
import { AppError } from '../middleware/error-handler.js';
import { authMiddleware } from '../middleware/auth.js';

type PopulateOption = string | { path: string; select?: string };

interface CrudOptions {
  /** Поля, доступные для поиска (text search) */
  searchFields?: string[];
  /** Поля, по которым можно сортировать */
  sortFields?: string[];
  /** Поля для автозаполнения (population) */
  populate?: PopulateOption[];
  /** Кастомные валидации для создания */
  createValidations?: ValidationChain[];
  /** Кастомные валидации для обновления */
  updateValidations?: ValidationChain[];
  /** Middleware перед созданием (например, проверить права) */
  beforeCreate?: (req: Request) => Promise<Partial<unknown>> | Partial<unknown>;
  /** Middleware после создания */
  afterCreate?: (doc: Document, req: Request) => Promise<void> | void;
  /** Фильтр для списка (например, показывать только свои записи) */
  listFilter?: (req: Request) => FilterQuery<unknown>;
  /** Разрешить гостевой доступ (без токена) */
  allowGuest?: boolean;
}

export function createCrudRouter<T extends Document>(
  model: Model<T>,
  options: CrudOptions = {}
): Router {
  const router = Router();
  const {
    searchFields = ['name', 'title'],
    sortFields = ['createdAt', 'updatedAt', 'name', 'title'],
    populate,
    createValidations = [],
    updateValidations = [],
    beforeCreate,
    afterCreate,
    listFilter,
    allowGuest = false
  } = options;

  // Middleware auth (опционально)
  if (!allowGuest) {
    router.use(authMiddleware);
  }

  // GET / — список с пагинацией, поиском, сортировкой
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const sort = (req.query.sort as string) || '-createdAt';
      const search = req.query.search as string;

      // Фильтр
      const filter: FilterQuery<unknown> = { ...(listFilter?.(req) || {}) };

      // Поиск по тексту
      if (search && searchFields.length > 0) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = searchFields.map(field => ({ [field]: searchRegex }));
      }

      // Сортировка
      const sortObj: Record<string, SortOrder> = {};
      const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
      if (sortFields.includes(sortField)) {
        sortObj[sortField] = sort.startsWith('-') ? -1 : 1;
      } else {
        sortObj.createdAt = -1;
      }

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        model.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .populate(populate || []),
        model.countDocuments(filter)
      ]);

      res.json(paginated(data, total, page, limit));
    } catch (err) {
      next(err);
    }
  });

  // GET /:id — одна запись
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doc = await model.findById(req.params.id).populate(populate || []);
      if (!doc) throw new AppError('Запись не найдена', 404);
      res.json(success(doc));
    } catch (err) {
      next(err);
    }
  });

  // POST / — создание
  router.post('/', createValidations, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array().map(e => e.msg).join('; '));
      }

      let data = { ...req.body };
      if (beforeCreate) {
        const extra = await beforeCreate(req);
        data = { ...data, ...extra };
      }

      const doc = await model.create(data);
      if (afterCreate) await afterCreate(doc, req);

      res.status(201).json(success(doc, 'Создано успешно'));
    } catch (err) {
      next(err);
    }
  });

  // PUT /:id — обновление
  router.put('/:id', updateValidations, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array().map(e => e.msg).join('; '));
      }

      const doc = await model.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).populate(populate || []);

      if (!doc) throw new AppError('Запись не найдена', 404);
      res.json(success(doc, 'Обновлено успешно'));
    } catch (err) {
      next(err);
    }
  });

  // DELETE /:id — удаление
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doc = await model.findByIdAndDelete(req.params.id);
      if (!doc) throw new AppError('Запись не найдена', 404);
      res.json(success(null, 'Удалено успешно'));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
