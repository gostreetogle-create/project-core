# CHANGELOG

Все значимые изменения в project-core.

Формат основан на [Keep a Changelog](https://keepachangelog.com/).

---

## [1.0.1] — 2026-06-03

### Added
- **Тесты kp-*:** 3 новых spec-файла — kp-datepicker, kp-file-upload, kp-toggle (создание, рендер, значения по умолчанию, outputs)
- **ANGULAR_21_FEATURES.md:** компактный справочник фич Angular 21 (сигналы, control flow, zoneless, отличия от 19/20)
- **SIGNAL_FORMS_RESEARCH.md:** разведка экспериментальных Signal Forms — API, сравнение, рекомендации для ядра
- **KNOWLEDGE_BASE.md:** ссылка на ANGULAR_21_FEATURES.md в разделе «Технологический стек»

### Fixed
- **NG0303 в kp-dialog.spec.ts:** тест переписан без `componentRef.setInput()` — JIT-компилятор Angular 21 не обрабатывает метаданные signal inputs (баг задокументирован в ANGULAR_21_FEATURES.md)
- **seed_chromadb.py:** DuplicateIDError исправлен добавлением уникальных счётчиков ID
- **Backend:** `npm install` в `backend/` после git pull — пропущенный `helmet` и другие пакеты

### Changed
- Тесты: 92→100, 18→21 spec-файл
- ChromaDB: 26→105 документов, 5→11 файлов знаний

### Technical
- Исследована совместимость `@analogjs/vite-plugin-angular` — несовместим с Angular 21 (требует `@angular/build/private`)
- Исследован статус Angular 22 — RC-стадия, стабильного релиза нет
- Signal Forms: рекомендовано не использовать до стабилизации API

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
