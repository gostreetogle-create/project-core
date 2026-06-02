import swaggerUi from 'swagger-ui-express';
import type { Express, Request, Response } from 'express';
import { env } from '../config/env.js';

// ========================================
// Вспомогательные функции для построения путей
// ========================================

const pageParams = [
  { name: 'page', in: 'query' as const, schema: { type: 'integer' as const, default: 1 }, description: 'Номер страницы' },
  { name: 'limit', in: 'query' as const, schema: { type: 'integer' as const, default: 20 }, description: 'Записей на странице' },
  { name: 'sort', in: 'query' as const, schema: { type: 'string' as const, default: '-createdAt' }, description: 'Поле сортировки (префикс - = по убыванию)' },
  { name: 'search', in: 'query' as const, schema: { type: 'string' as const }, description: 'Поиск по текстовым полям' },
];

const idParam = { name: 'id', in: 'path' as const, required: true, schema: { type: 'string' as const } };

const authErrors = {
  '401': { description: 'Требуется авторизация' },
  '403': { description: 'Недостаточно прав' },
};

/** Создать 5 CRUD-эндпоинтов для сущности */
function crudPaths(
  tag: string,
  entityName: string,
  entityPath: string,
  schemaRef: string,
  createBodyProps: Record<string, unknown>,
): Record<string, unknown> {
  // Ссылка на схему сущности
  const entity = { '$ref': `#/components/schemas/${schemaRef}` };

  // Ответ для GET-списка: PaginatedResponse с массивом сущностей
  const listContent = {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array', items: entity },
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
    },
  };

  // Ответ для GET-by-id: ApiResponse с сущностью
  const singleContent = {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: entity,
          message: { type: 'string' },
        },
      },
    },
  };

  // Ответ для POST/PUT: ApiResponse с сущностью + message
  const mutateContent = {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: entity,
          message: { type: 'string' },
        },
      },
    },
  };

  return {
    [`/api/v1/${entityPath}`]: {
      get: {
        tags: [tag],
        summary: `Список ${entityName}`,
        security: [{ bearerAuth: [] }],
        parameters: pageParams,
        responses: {
          '200': { description: `Список ${entityName} с пагинацией`, content: listContent },
          ...authErrors,
        },
      },
      post: {
        tags: [tag],
        summary: `Создать ${entityName}`,
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: createBodyProps, required: Object.keys(createBodyProps) },
            },
          },
        },
        responses: {
          '201': { description: `${entityName} создан(а)`, content: mutateContent },
          '400': { description: 'Ошибка валидации' },
          ...authErrors,
        },
      },
    },
    [`/api/v1/${entityPath}/{id}`]: {
      get: {
        tags: [tag],
        summary: `Получить ${entityName} по ID`,
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          '200': { description: `Данные ${entityName}`, content: singleContent },
          '404': { description: 'Запись не найдена' },
          ...authErrors,
        },
      },
      put: {
        tags: [tag],
        summary: `Обновить ${entityName}`,
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: createBodyProps },
            },
          },
        },
        responses: {
          '200': { description: `${entityName} обновлён(а)`, content: mutateContent },
          '404': { description: 'Запись не найдена' },
          ...authErrors,
        },
      },
      delete: {
        tags: [tag],
        summary: `Удалить ${entityName}`,
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          '200': { description: `${entityName} удалён(а)` },
          '404': { description: 'Запись не найдена' },
          ...authErrors,
        },
      },
    },
  };
}

// ========================================
// Схемы данных
// ========================================

const schemas = {
  Error: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      data: { type: 'null' },
      message: { type: 'string' },
    },
  },
  User: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      username: { type: 'string' },
      displayName: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string', enum: ['admin', 'manager', 'viewer'] },
      permissions: { type: 'array', items: { type: 'string' } },
    },
  },
  LoginResponse: {
    type: 'object',
    properties: {
      user: { '$ref': '#/components/schemas/User' },
      accessToken: { type: 'string' },
    },
  },
  RefreshResponse: {
    type: 'object',
    properties: {
      accessToken: { type: 'string' },
    },
  },
  // ═══════════════════════════════════════════
  // При создании проекта — добавьте свои схемы сюда.
  // Используйте helper crudPaths() выше для автоматической
  // генерации 5 CRUD-эндпоинтов с документацией.
  // ═══════════════════════════════════════════
};

// ========================================
// Swagger-документ
// ========================================

const swaggerDoc = {
  openapi: '3.0.3',
  info: {
    title: 'Project Core API',
    version: '1.0.0',
    description: [
      'Универсальное ядро для CRM/PLM/ERP систем малого производства.',
      '',
      '## Аутентификация',
      '— `POST /auth/login` → accessToken (в теле) + refreshToken (HttpOnly cookie)',
      '— Все CRUD-эндпоинты требуют заголовок `Authorization: Bearer <accessToken>`',
      '— При истечении accessToken — авторефреш через `POST /auth/refresh`',
      '',
      '## CRUD',
      'Каждая сущность имеет 5 стандартных эндпоинтов:',
      '`GET /` (список), `GET /:id` (одна), `POST /` (создать), `PUT /:id` (обновить), `DELETE /:id` (удалить)',
    ].join('\n'),
  },
  servers: [
    { url: `http://localhost:${env.PORT}`, description: 'Development' },
  ],
  tags: [
    { name: 'System', description: 'Проверка работоспособности' },
    { name: 'Auth', description: 'Аутентификация и авторизация' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Проверка работоспособности',
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, timestamp: { type: 'string' } } } } },
          },
        },
      },
    },

    // ---- Auth ----
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Вход в систему',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' } }, required: ['username', 'password'] } } },
        },
        responses: {
          '200': { description: 'Успешный вход', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { '$ref': '#/components/schemas/LoginResponse' } } } } } },
          '401': { description: 'Неверный логин или пароль', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
          '429': { description: 'Слишком много попыток' },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Обновление access-токена',
        description: 'Читает refreshToken из HttpOnly cookie. Возвращает новый accessToken.',
        responses: {
          '200': { description: 'Новый accessToken', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { '$ref': '#/components/schemas/RefreshResponse' } } } } } },
          '401': { description: 'Refresh-токен истёк или отсутствует' },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Выход из системы',
        description: 'Очищает HttpOnly cookie с refresh-токеном.',
        responses: { '200': { description: 'Успешный выход' } },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Текущий пользователь',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Данные пользователя', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { '$ref': '#/components/schemas/User' } } } } } },
          '401': { description: 'Требуется авторизация' },
        },
      },
    },

    // ═══════════════════════════════════════════
    // При создании проекта — добавьте CRUD-пути для своих сущностей.
    // Пример:
    //   ...crudPaths('МоиСущности', 'сущность', 'my-entity', 'MyEntity', {
    //     name: { type: 'string' },
    //   }),
    // ═══════════════════════════════════════════
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas,
  },
};

export function setupSwagger(app: Express): void {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
  app.get('/api/docs.json', (_req: Request, res: Response) => { res.json(swaggerDoc); });
}
