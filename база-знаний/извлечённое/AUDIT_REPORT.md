# AUDIT REPORT — Project Core v1.0

> **Дата:** 2026-06-02
> **Аудитор:** Buffy (Codebuff AI) + Gemini (thinker)
> **Метод:** Полное прочтение всех файлов + семантический анализ + проверка соответствия AGENTS.md
> **Назначение:** Единый документ для понимания текущего состояния ядра и плана доведения до идеала.

---

## Резюме

Проект `project-core` — **качественно спроектированное ядро** (7/10). Архитектура слоёв, CRUD Factory, UI Kit, дизайн-токены, Docker Compose, start.ps1 — сильные решения. Однако есть критические пробелы в безопасности, нет ни одного теста, и несколько собственных правил AGENTS.md нарушены. Ниже — полный разбор.

**Общая оценка:** 🟡 Хорошо, но не идеал. ~20 недочётов требуют исправления.

---

## СИЛЬНЫЕ СТОРОНЫ (что сделано отлично)

| # | Аспект | Детали |
|---|--------|--------|
| 1 | **Слоистая архитектура** | `core → shared → features → layout` — строго, чисто, без циклических зависимостей |
| 2 | **CRUD Factory** | `createCrudRouter()` — гениальное решение, убирает 90% бойлерплейта для новых сущностей |
| 3 | **UI Kit (kp-*)** | 10 компонентов-обёрток над PrimeNG, с Signals + OnPush + Standalone |
| 4 | **Дизайн-токены** | `_tokens.scss` — все цвета/размеры/шрифты в одном месте, тёмная тема из коробки |
| 5 | **JWT Auth** | access + refresh токены, middleware, optionalAuth — грамотно |
| 6 | **Docker Compose** | MongoDB + backend, healthcheck, именованные volume (данные не теряются) |
| 7 | **start.ps1** | Одна команда → всё работает. Проверки, установка, порты, браузер |
| 8 | **База знаний** | KNOWLEDGE_BASE.md, BUSINESS_LOGIC_RU.md, протокол-сессии.md — отличная документация |
| 9 | **ESLint** | Строгие правила: `no-explicit-any`, `no-unused-vars`, angular-eslint |
| 10 | **Lazy Loading** | Все страницы — `loadComponent`, ни одного eager-импорта |

---

## ВСЕ НАЙДЕННЫЕ ПРОБЛЕМЫ (ранжированы по критичности)

### 🔴 P0 — КРИТИЧНО (должно быть исправлено до начала новых проектов)

#### P0-1. Нет unit-тестов вообще
- **Где:** Весь проект
- **Суть:** 10 UI-компонентов + 4 сервиса + 2 страницы + backend = 0 тестов
- **Правило AGENTS.md:** «После правок: `ng build` + `ng lint` + тесты» — тесты обязательны, но их нет
- **Риск:** При добавлении бизнес-логики регрессии нечем ловить
- **Исправление:** Написать минимум: unit-тесты на все kp-* компоненты, тесты на AuthService, тесты на CRUD Factory

#### P0-2. Refresh-токен в localStorage — уязвимость к XSS
- **Где:** `src/app/core/auth.service.ts` строки 14-15
- **Суть:** И `accessToken`, и `refreshToken` хранятся в `localStorage`, доступны любому JS на странице
- **Риск:** XSS-атака → кража refreshToken → полный захват сессии
- **Исправление:** Refresh-токен должен приходить в HttpOnly cookie (установленной бэкендом). Access-токен можно оставить в памяти (не localStorage)

#### P0-3. Нет rate limiting на бэкенде
- **Где:** `backend/src/index.ts` — нет middleware для rate limit
- **Риск:** Брутфорс паролей, DDoS на API
- **Исправление:** Добавить `express-rate-limit`, минимум на `/api/v1/auth/login`

#### P0-4. Нет helmet (security headers)
- **Где:** `backend/src/index.ts` — нет `app.use(helmet())`
- **Риск:** XSS, clickjacking, information disclosure (`X-Powered-By: Express`)
- **Исправление:** `npm install helmet` + `app.use(helmet())`

#### P0-5. express.json() без лимита
- **Где:** `backend/src/index.ts` строка `app.use(express.json())`
- **Риск:** POST-запрос с телом в 1GB положит сервер
- **Исправление:** `app.use(express.json({ limit: '1mb' }))`

#### P0-6. Backend Dockerfile — битый production-билд
- **Где:** `backend/Dockerfile`
- **Суть:** `tsc` компилирует ESM-код в `dist/`, но **не добавляет** `.js` расширения к импортам. Node.js в режиме ESM (`"type": "module"`) требует расширения. Результат: `docker compose up` → backend падает с `ERR_MODULE_NOT_FOUND`
- **Исправление:** Вариант А: использовать `tsx` (а не `tsc`) для продакшена. Вариант Б: компилировать в CommonJS (убрать `"type": "module"`). Вариант В: добавить `.js` в импорты И использовать `tsc-alias`

---

### 🟠 P1 — ВАЖНО (нарушения правил, архитектурные дыры)

#### P1-1. Layout и Login нарушают правило «только kp-*» (прямые импорты PrimeNG)
- **Где:** `admin-layout.component.ts` (DrawerModule, ButtonModule, AvatarModule, MenuModule, TieredMenuModule, TooltipModule), `login.component.ts` (ToastModule)
- **Правило AGENTS.md:** «🔴 Прямой `primeng/*` в features → через shared/ui/»
- **Сложность:** Для layout это объективно нужно — p-drawer, p-avatar, p-tieredMenu не имеют kp-* обёрток. Для login — ToastModule можно заменить на kp-toast
- **Исправление:** Создать kp-drawer, kp-avatar, kp-menu, kp-tiered-menu компоненты ИЛИ документировать layout как исключение из правила

#### P1-2. OnPush отсутствует в Login и AdminLayout
- **Где:** `login.component.ts`, `admin-layout.component.ts`
- **Правило AGENTS.md:** «✅ OnPush change detection» — обязательно
- **Исправление:** Добавить `changeDetection: ChangeDetectionStrategy.OnPush` в оба декоратора

#### P1-3. AuthService.login() не использует ApiResponse<T>
- **Где:** `auth.service.ts` метод `login()`
- **Суть:** Тип возврата — `<{data: { user: User... }}>` вместо `ApiResponse<LoginResponse>`
- **Правило AGENTS.md:** «✅ Все API-ответы через `ApiResponse<T>`»
- **Исправление:** Использовать `ApiResponse<LoginResponse>` из `shared/types/index.ts`

#### P1-4. Auth interceptor не обрабатывает 401 (нет авто-рефреша)
- **Где:** `auth.interceptor.ts`
- **Суть:** При истечении access-токена все запросы падают с 401. Никакой попытки обновить токен через refresh
- **Риск:** Пользователь вынужден перелогиниваться каждые 24 часа
- **Исправление:** В interceptor: поймать 401 → вызвать `authService.refreshToken()` → повторить исходный запрос

#### P1-5. AuthService.loadUserFromStorage() не проверяет exp токена
- **Где:** `auth.service.ts` метод `loadUserFromStorage()`
- **Суть:** Делает `atob(token.split('.')[1])` — извлекает payload, но НЕ проверяет `payload.exp`. Пользователь считается залогиненным даже с истёкшим токеном
- **Исправление:** Проверять `payload.exp * 1000 > Date.now()`, иначе — logout

#### P1-6. Нет Graceful Shutdown на бэкенде
- **Где:** `backend/src/index.ts` — нет обработчиков SIGTERM/SIGINT
- **Риск:** Docker stop → жёсткий обрыв соединений MongoDB, возможна потеря данных
- **Исправление:** Добавить:
```typescript
process.on('SIGTERM', async () => {
  await mongoose.disconnect();
  server.close(() => process.exit(0));
});
```

#### P1-7. Нет structured logging
- **Где:** Весь backend
- **Суть:** `console.log`, `console.error`, `console.warn` — нет уровней, нет формата, нет ротации
- **Исправление:** Добавить `pino` или `winston` с уровнями: error, warn, info, debug

---

### 🟡 P2 — ЖЕЛАТЕЛЬНО (улучшит качество, но не блокирует)

#### P2-1. API Service: нет таймаутов и retry
- **Где:** `api.service.ts`
- **Суть:** HTTP-запросы без `.pipe(timeout(30000), retry(1))`. При обрыве сети — вечная загрузка
- **Исправление:** Добавить `timeout` и `retry` для GET-запросов

#### P2-2. CRUD Factory: нет проекции полей (selectFields)
- **Где:** `crud-factory.ts`
- **Суть:** `GET /` возвращает ВСЕ поля документа. При большой модели (HTML-контент, base64-изображения) это перегружает сеть
- **Исправление:** Добавить опцию `selectFields` в `CrudOptions` и параметр `?fields=` в query

#### P2-3. Жёстко зашитый baseUrl в ApiService
- **Где:** `api.service.ts` — `baseUrl = '/api/v1'`
- **Суть:** Нельзя переопределить для SSR, CDN, микросервисов
- **Исправление:** Использовать InjectionToken + environment-файлы

#### P2-4. Нет Swagger/OpenAPI документации
- **Где:** Backend
- **Риск:** Новый разработчик (или AI) не знает доступные endpoint'ы
- **Исправление:** Добавить `swagger-jsdoc` + `swagger-ui-express`

#### P2-5. Нет CORS-настроек для продакшена
- **Где:** `backend/src/index.ts` — `cors({ origin: env.CORS_ORIGIN })`
- **Суть:** Только один origin, нет массива, нет динамической проверки
- **Исправление:** Поддержка массива origins + динамическая функция проверки

#### P2-6. Shared/types дублируют типы из core
- **Где:** `shared/types/index.ts` vs `api.service.ts` vs `auth.service.ts`
- **Суть:** `ApiResponse`, `User`, `LoginResponse` определены в нескольких местах. Единый источник — `shared/types/`, но он не используется везде
- **Исправление:** Импортировать типы из `shared/types/` во всех сервисах

#### P2-7. Нет HttpOnly cookie для refresh-токена на бэкенде
- **Где:** `auth.routes.ts` — токен возвращается в теле ответа
- **Суть:** Бэкенд должен устанавливать `Set-Cookie` заголовок с `httpOnly: true, secure: true, sameSite: 'strict'`
- **Исправление:** Добавить установку cookie в ответе `/auth/login` и `/auth/refresh`

#### P2-8. Login компонент: нет отписки от Observable
- **Где:** `login.component.ts` метод `login()` — `.subscribe(...)` без `takeUntilDestroyed()`
- **Риск:** Утечка памяти при быстром уходе со страницы
- **Исправление:** Добавить `pipe(takeUntilDestroyed())` или использовать `DestroyRef`

#### P2-9. Нет i18n (интернационализации)
- **Где:** Весь фронтенд
- **Суть:** Все строки жёстко зашиты на русском. Если проект пойдёт на экспорт — придётся переписывать все шаблоны
- **Исправление:** Настроить `@angular/localize` + вынести строки в JSON

---

### 🟢 P3 — НА БУДУЩЕЕ (улучшения, не обязательные сейчас)

#### P3-1. ChromaDB: не хватает индексации кода
- **Где:** `база-знаний/chroma_db/`
- **Сейчас:** 3 файла (KNOWLEDGE_BASE, BUSINESS_LOGIC_RU, SUMMARY) → ~26 документов
- **Проблема:** Не проиндексированы: AGENTS.md, README.md, протокол-сессии.md, исходный код
- **Исправление:** Дополнить `seed_chromadb.py` индексацией `.ts`/`.html`/`.scss` файлов ядра

#### P3-2. Нет компонента kp-datepicker / kp-calendar
- **Где:** `shared/ui/` — отсутствует
- **Суть:** Для бизнес-логики (КП, заказы) даты критичны
- **Исправление:** Создать kp-datepicker на основе PrimeNG Calendar

#### P3-3. Нет компонента kp-file-upload
- **Где:** `shared/ui/` — отсутствует
- **Суть:** Для загрузки изображений товаров, документов
- **Исправление:** Создать kp-file-upload на основе PrimeNG FileUpload

#### P3-4. Нет компонента kp-toggle / kp-switch
- **Где:** `shared/ui/` — отсутствует
- **Суть:** Для настроек, включения/выключения
- **Исправление:** Создать kp-toggle

#### P3-5. Нет a11y (accessibility)
- **Где:** Весь фронтенд
- **Суть:** Нет ARIA-лейблов, нет skip-to-content, нет keyboard navigation
- **Исправление:** Добавить базовые a11y-атрибуты

#### P3-6. Нет ErrorHandler на фронтенде
- **Где:** `app.config.ts` — нет кастомного ErrorHandler
- **Суть:** Непойманные ошибки Angular падают в консоль без обработки
- **Исправление:** Создать GlobalErrorHandler и зарегистрировать в providers

#### P3-7. Нет HTTP caching strategy
- **Где:** `api.service.ts`
- **Суть:** Нет кеширования GET-запросов, нет `Cache-Control` заголовков
- **Исправление:** Добавить простой in-memory cache + поддержку ETag

#### P3-8. Нет CI/CD (GitHub Actions / GitLab CI)
- **Где:** `.github/workflows/` — отсутствует
- **Суть:** Нет автоматического запуска тестов и сборки при пуше
- **Исправление:** Создать простой workflow: lint → test → build

#### P3-9. CHANGELOG.md отсутствует
- **Где:** Корень проекта
- **Правило AGENTS.md:** «Каждый этап записывается в CHANGELOG.md»
- **Исправление:** Создать CHANGELOG.md с историей изменений

#### P3-10. tsconfig.spec.json не включает shared/types
- **Где:** `tsconfig.spec.json` — `include: ["src/**/*.spec.ts", "src/**/*.d.ts"]`
- **Суть:** `shared/types/` не попадает в компиляцию тестов (он за пределами `src/`)
- **Исправление:** Добавить путь или перенести `shared/types/` в `src/app/shared/types/`

---

## СВОДНАЯ ТАБЛИЦА

| # | Приоритет | Проблема | Локация | Сложность исправления |
|---|-----------|----------|---------|----------------------|
| 1 | 🔴 P0 | Нет тестов | Весь проект | Высокая (много писать) |
| 2 | 🔴 P0 | Refresh в localStorage | auth.service.ts | Средняя |
| 3 | 🔴 P0 | Нет rate limiting | backend/index.ts | Низкая |
| 4 | 🔴 P0 | Нет helmet | backend/index.ts | Низкая |
| 5 | 🔴 P0 | express.json без лимита | backend/index.ts | Низкая |
| 6 | 🔴 P0 | Dockerfile ESM битый | backend/Dockerfile | Средняя |
| 7 | 🟠 P1 | Прямые импорты PrimeNG | layout, login | Средняя |
| 8 | 🟠 P1 | Нет OnPush в login/layout | login, layout | Низкая |
| 9 | 🟠 P1 | ApiResponse не используется | auth.service.ts | Низкая |
| 10 | 🟠 P1 | 401 без авто-рефреша | auth.interceptor.ts | Средняя |
| 11 | 🟠 P1 | Не проверяется exp токена | auth.service.ts | Низкая |
| 12 | 🟠 P1 | Нет Graceful Shutdown | backend/index.ts | Низкая |
| 13 | 🟠 P1 | Нет structured logging | backend | Средняя |
| 14 | 🟡 P2 | Нет timeout/retry в API | api.service.ts | Низкая |
| 15 | 🟡 P2 | Нет проекции полей | crud-factory.ts | Низкая |
| 16 | 🟡 P2 | Жёсткий baseUrl | api.service.ts | Низкая |
| 17 | 🟡 P2 | Нет Swagger | backend | Средняя |
| 18 | 🟡 P2 | CORS только 1 origin | backend/index.ts | Низкая |
| 19 | 🟡 P2 | Дублирование типов | shared/types vs core | Низкая |
| 20 | 🟡 P2 | Нет HttpOnly cookie | auth.routes.ts | Средняя |
| 21 | 🟡 P2 | Утечка Observable | login.component.ts | Низкая |
| 22 | 🟡 P2 | Нет i18n | фронтенд | Высокая |
| 23 | 🟢 P3 | ChromaDB без кода | seed_chromadb.py | Средняя |
| 24 | 🟢 P3 | Нет kp-datepicker | shared/ui/ | Средняя |
| 25 | 🟢 P3 | Нет kp-file-upload | shared/ui/ | Средняя |
| 26 | 🟢 P3 | Нет kp-toggle | shared/ui/ | Низкая |
| 27 | 🟢 P3 | Нет a11y | фронтенд | Средняя |
| 28 | 🟢 P3 | Нет GlobalErrorHandler | app.config.ts | Низкая |
| 29 | 🟢 P3 | Нет HTTP caching | api.service.ts | Средняя |
| 30 | 🟢 P3 | Нет CI/CD | проект | Средняя |
| 31 | 🟢 P3 | Нет CHANGELOG.md | корень | Низкая |
| 32 | 🟢 P3 | tsconfig.spec не видит shared | tsconfig.spec.json | Низкая |

---

## ПЛАН ДОВЕДЕНИЯ ДО ИДЕАЛА (рекомендуемый порядок)

### Фаза 1: Безопасность (P0) — 1-2 часа
1. `helmet` + `express.json({ limit })` + `express-rate-limit`
2. Refresh-токен → HttpOnly cookie (бэкенд + фронтенд)
3. Починить Dockerfile (tsx для продакшена)

### Фаза 2: Архитектурные исправления (P1) — 2-3 часа
4. OnPush в login и admin-layout
5. ApiResponse в auth.service
6. 401-авторефреш в interceptor
7. Проверка exp в loadUserFromStorage
8. Graceful shutdown
9. Structured logging (pino)

### Фаза 3: Frontend-улучшения (P1-P2) — 2-3 часа
10. kp-drawer, kp-avatar, kp-menu — закрыть прямые импорты PrimeNG в layout
11. kp-toast в login вместо прямого ToastModule
12. timeout/retry в api.service
13. selectFields в crud-factory
14. InjectionToken для baseUrl
15. takeUntilDestroyed в login

### Фаза 4: Тесты (P0) — 4-6 часов
16. Unit-тесты на все 10 kp-* компонентов
17. Unit-тесты на AuthService, ApiService
18. Интеграционные тесты на CRUD Factory

### Фаза 5: Документация и DX (P2-P3) — 2-3 часа
19. Swagger/OpenAPI
20. CHANGELOG.md
21. Обновить ChromaDB (проиндексировать код)
22. CI/CD (GitHub Actions)

### Фаза 6: Новые компоненты (P3) — 3-4 часа
23. kp-datepicker
24. kp-file-upload
25. kp-toggle
26. a11y-атрибуты

---

## СТАТУС CHROMADB

- **Коллекция:** `project_brain`
- **Документов:** ~26 (из 3 markdown-файлов: KNOWLEDGE_BASE.md, BUSINESS_LOGIC_RU.md, SUMMARY.md)
- **Не проиндексировано:** AGENTS.md, README.md, протокол-сессии.md, весь исходный код (.ts, .html, .scss)
- **Рекомендация:** Перегенерировать с включением всех Markdown-файлов проекта + выборочно ключевые исходники

---

*Конец AUDIT_REPORT.md. Обновлять при каждом новом аудите.*
