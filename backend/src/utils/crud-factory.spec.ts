import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Schema, Document } from 'mongoose';
import express from 'express';
import request from 'supertest';
import { createCrudRouter } from './crud-factory.js';
import { AppError, errorHandler } from '../middleware/error-handler.js';

// ========================================
// Тестовая Mongoose-модель
// ========================================

interface ITestItem extends Document {
  name: string;
  status: string;
  createdBy?: string;
}

const testSchema = new Schema<ITestItem>(
  {
    name: { type: String, required: true },
    status: { type: String, default: 'draft' },
    createdBy: { type: String },
  },
  { timestamps: true }
);

const TestModel = mongoose.model<ITestItem>('TestItem', testSchema);

// ========================================
// Настройка тестов
// ========================================

describe('createCrudRouter', () => {
  let mongoServer: MongoMemoryServer;
  let app: express.Express;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Создаём Express-приложение с тестовым CRUD-роутером
    app = express();
    app.use(express.json());

    const router = createCrudRouter(TestModel, {
      searchFields: ['name'],
      sortFields: ['createdAt', 'name'],
      createValidations: [],
      updateValidations: [],
      allowGuest: true, // пропускаем auth для тестов
    });

    app.use('/api/v1/test-items', router);
    app.use(errorHandler);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // POST / — Создание
  describe('POST /', () => {
    it('создаёт запись и возвращает 201', async () => {
      const res = await request(app)
        .post('/api/v1/test-items')
        .send({ name: 'Test 1' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test 1');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data._id).toBeTruthy();
    });

    it('возвращает 400 для пустого тела', async () => {
      await request(app)
        .post('/api/v1/test-items')
        .send({})
        .expect(400);
    });
  });

  // GET / — Список с пагинацией
  describe('GET /', () => {
    beforeAll(async () => {
      await TestModel.deleteMany({});
      for (let i = 1; i <= 5; i++) {
        await TestModel.create({ name: `Item ${i}`, status: i % 2 === 0 ? 'active' : 'draft' });
      }
    });

    it('возвращает список с пагинацией', async () => {
      const res = await request(app)
        .get('/api/v1/test-items')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(5);
      expect(res.body.total).toBe(5);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(20);
      expect(res.body.totalPages).toBe(1);
    });

    it('поддерживает limit', async () => {
      const res = await request(app)
        .get('/api/v1/test-items?limit=2')
        .expect(200);

      expect(res.body.data.length).toBe(2);
      expect(res.body.total).toBe(5);
      expect(res.body.totalPages).toBe(3);
    });

    it('поддерживает поиск', async () => {
      const res = await request(app)
        .get('/api/v1/test-items?search=Item 1')
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.some((d: ITestItem) => d.name === 'Item 1')).toBe(true);
    });

    it('поддерживает сортировку', async () => {
      const res = await request(app)
        .get('/api/v1/test-items?sort=name')
        .expect(200);

      expect(res.body.data[0].name).toBe('Item 1');
      expect(res.body.data[4].name).toBe('Item 5');
    });
  });

  // GET /:id — Одна запись
  describe('GET /:id', () => {
    let itemId: string;

    beforeAll(async () => {
      const doc = await TestModel.findOne({ name: 'Item 1' });
      itemId = doc!._id.toString();
    });

    it('возвращает запись по ID', async () => {
      const res = await request(app)
        .get(`/api/v1/test-items/${itemId}`)
        .expect(200);

      expect(res.body.data.name).toBe('Item 1');
    });

    it('возвращает 404 для несуществующего ID', async () => {
      await request(app)
        .get('/api/v1/test-items/000000000000000000000000')
        .expect(404);
    });
  });

  // PUT /:id — Обновление
  describe('PUT /:id', () => {
    let itemId: string;

    beforeAll(async () => {
      const doc = await TestModel.findOne({ name: 'Item 2' });
      itemId = doc!._id.toString();
    });

    it('обновляет запись', async () => {
      const res = await request(app)
        .put(`/api/v1/test-items/${itemId}`)
        .send({ name: 'Item 2 Updated', status: 'done' })
        .expect(200);

      expect(res.body.data.name).toBe('Item 2 Updated');
      expect(res.body.data.status).toBe('done');
    });
  });

  // DELETE /:id — Удаление
  describe('DELETE /:id', () => {
    it('удаляет запись', async () => {
      const doc = await TestModel.create({ name: 'To Delete' });
      await request(app)
        .delete(`/api/v1/test-items/${doc._id}`)
        .expect(200);

      const found = await TestModel.findById(doc._id);
      expect(found).toBeNull();
    });

    it('возвращает 404 для несуществующего ID', async () => {
      await request(app)
        .delete('/api/v1/test-items/000000000000000000000000')
        .expect(404);
    });
  });
});

// ========================================
// Тесты api-response.ts
// ========================================

import { success, paginated, error as apiError } from './api-response.js';

describe('api-response', () => {
  describe('success()', () => {
    it('создаёт успешный ответ', () => {
      const res = success({ id: 1 });
      expect(res.success).toBe(true);
      expect(res.data).toEqual({ id: 1 });
      expect(res.message).toBeUndefined();
    });

    it('включает сообщение если передано', () => {
      const res = success({ id: 1 }, 'OK');
      expect(res.message).toBe('OK');
    });
  });

  describe('paginated()', () => {
    it('вычисляет totalPages', () => {
      const res = paginated([1, 2, 3], 10, 1, 3);
      expect(res.total).toBe(10);
      expect(res.page).toBe(1);
      expect(res.limit).toBe(3);
      expect(res.totalPages).toBe(4); // ceil(10/3) = 4
      expect(res.data).toEqual([1, 2, 3]);
    });

    it('totalPages = 0 для пустого набора', () => {
      const res = paginated([], 0, 1, 20);
      expect(res.totalPages).toBe(0);
    });
  });

  describe('error()', () => {
    it('создаёт ответ с ошибкой', () => {
      const res = apiError('Что-то пошло не так');
      expect(res.success).toBe(false);
      expect(res.data).toBeNull();
      expect(res.message).toBe('Что-то пошло не так');
    });
  });
});
