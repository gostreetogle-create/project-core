# CHANGELOG

Все значимые изменения в project-core.

Формат основан на [Keep a Changelog](https://keepachangelog.com/).

---

## [1.0.0] — 2026-06-02

### Added
- **Безопасность:** helmet, express-rate-limit, express.json(limit), HttpOnly cookie для refresh-токена
- **Логирование:** структурированные логи через pino (JSON в production, pretty в dev)
- **Graceful Shutdown:** корректное завершение при SIGTERM/SIGINT, отключение от MongoDB
- **401-авторефреш:** автоматическое обновление токена при ошибке 401, очередь конкурирующих запросов
- **Проверка exp:** загрузка пользователя из токена с проверкой срока действия
- **Mongoose-ошибки:** ValidationError → 400, CastError → 400 в CRUD Factory
- **Swagger:** интерактивная документация API на `/api/docs`
- **UI Kit:** 10 kp-* компонентов (button, input, select, card, table, dialog, badge, toast, confirm-dialog, breadcrumb)
- **Новые kp-компоненты:** drawer, avatar, tiered-menu
- **Витрина UI Kit:** страница `/ui-kit` с примерами всех компонентов
- **OnPush:** во всех компонентах (включая login, admin-layout)
- **Тесты:** 108 unit/интеграционных тестов (фронтенд 92 + бэкенд 16)

### Changed
- Refresh-токен: из localStorage → HttpOnly cookie (безопасность)
- Dockerfile: tsc → tsx (исправлена production-сборка)
- Admin-layout: прямые PrimeNG-импорты заменены на kp-*
- Login: ToastModule+MessageService → KpToast+NotificationService
- ApiService: унифицированы типы ApiResponse через shared/types

### Fixed
- JWT sign: TS2769 исправлен через `as jwt.SignOptions`
- user.model.ts: TS2790 (delete в strict mode) заменён на деструктуризацию
- angular.json: добавлен lint target
- start.ps1: 3 бага (InvalidVariableReference, раскрытие переменных, NG_CLI_ANALYTICS)
- Lint: 14→0 ошибок (*ngIf→@if, output-ы переименованы, неиспользуемые переменные)

### Technical
- Node.js v24.15.0, Angular (latest), Express 4, MongoDB/Mongoose 8
- Vitest (фронтенд + бэкенд), pino, helmet, express-rate-limit
- Docker Compose (MongoDB + backend)
- ChromaDB (векторная БД знаний, 26 документов)
