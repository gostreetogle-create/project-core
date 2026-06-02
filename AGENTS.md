# Project Core — Правила разработки

> Читать перед любыми правками.

---

## Слои (строго!)

```
core → shared → features → layout
```

- **core/** — сервисы. Не знает про страницы.
- **shared/** — общие элементы. Не знает про страницы.
- **features/** — страницы. НЕ зависят друг от друга.
- **layout/** — оболочка. Знает всё.

---

## Запреты

- 🔴 `any` → `unknown` + type guard
- 🔴 constructor DI → `inject()`
- 🔴 NgModules → Standalone
- 🔴 Inline-стили → SCSS
- 🔴 Raw HTML → PrimeNG / kp-*
- 🔴 Прямой `primeng/*` в features → через shared/ui/
- 🔴 Секреты в коде → `.env`
- 🔴 NgRx → Signals достаточно

---

## Обязательно

- ✅ После правок: `ng build` + `ng lint` + тесты
- ✅ Все API-ответы через `ApiResponse<T>`
- ✅ Пагинация для списков
- ✅ Русский язык в интерфейсе
- ✅ OnPush change detection
- ✅ Signals вместо свойств

---

## UI Kit

Все элементы — обёртки над PrimeNG в `shared/ui/`.

Именование: `kp-имя` (kp-button, kp-table, kp-dialog…).

Никаких прямых `primeng/*` на страницах.

### Доступные компоненты

| Компонент | Импорт | Использование |
|-----------|--------|---------------|
| Кнопка | `KpButtonComponent` | `<kp-button>` |
| Поле ввода | `KpInputComponent` | `<kp-input>` |
| Выпадающий список | `KpSelectComponent` | `<kp-select>` |
| Карточка | `KpCardComponent` | `<kp-card>` |
| Таблица | `KpTableComponent` | `<kp-table>` |
| Диалог | `KpDialogComponent` | `<kp-dialog>` |
| Уведомление | `KpToastComponent` | `<kp-toast>`, `MessageService` |
| Подтверждение | `KpConfirmDialogComponent` | `<kp-confirm-dialog>`, `ConfirmationService` |
| Бейдж | `KpBadgeComponent` | `<kp-badge>` |
| Хлебные крошки | `KpBreadcrumbComponent` | `<kp-breadcrumb>` |
| Боковая панель | `KpDrawerComponent` | `<kp-drawer>` |
| Аватар | `KpAvatarComponent` | `<kp-avatar>` |
| Меню | `KpTieredMenuComponent` | `<kp-tiered-menu>` |
| Выбор даты | `KpDatepickerComponent` | `<kp-datepicker>` |
| Загрузка файлов | `KpFileUploadComponent` | `<kp-file-upload>` |
| Переключатель | `KpToggleComponent` | `<kp-toggle>` |

---

## Backend

### Структура модуля

```typescript
// modules/my-entity.model.ts — Mongoose модель
// modules/my-entity.routes.ts — роутер (createCrudRouter)
// В index.ts: app.use('/api/v1/entity', entityRoutes)
```

### CRUD Factory

```typescript
import { createCrudRouter } from '../utils/crud-factory.js';

const router = createCrudRouter(MyModel, {
  searchFields: ['name', 'article'],
  populate: ['category'],
  beforeCreate: async (req) => ({ createdBy: req.user?.userId })
});

export default router;
```

---

## Создание нового проекта из ядра

### Процесс (для AI-агента)

1. **Инициализация**
   - Скопировать папку project-core
   - Удалить .git
   - Настроить .env
   - Инициализировать новый git

2. **Бизнес-логика**
   - Прочитать бизнес-логику из BUSINESS_LOGIC_RU.md
   - Если вопросы — задать пользователю
   - Записать решения в чек-лист

3. **Реализация (послойно)**
   - Этап 1: Модели данных (Mongoose)
   - Этап 2: CRUD роутеры
   - Этап 3: Сервисы на фронте
   - Этап 4: Страницы (список → создание → редактирование)
   - Этап 5: Тесты
   - Этап 6: Документация

4. **Финализация**
   - `ng build` — проверка сборки
   - Запуск тестов
   - Обновить README под проект
   - git init + commit

### Чек-лист (для защиты от потери контекста)

Каждый этап записывается в CHANGELOG.md с пометкой статуса:
- `[x]` — выполнено
- `[ ]` — ожидает
- `[?]` — требует уточнения

---

## FreezeGuard (система блокировки)

Файлы и папки могут иметь статус:

| Статус | Маркер | Что значит |
|--------|--------|------------|
| frozen | 🧊 | Заморожено. Редактировать только с разрешения |
| locked | 🔒 | Заблокировано. Не трогать |
| wip | 🚧 | В разработке. Можно менять |
| deprecated | 🗑 | Устарело. Будет удалено |

---
