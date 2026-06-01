# Project Core

**Универсальное ядро для создания веб-приложений.**

Готовый фундамент для любого сайта: структура, дизайн, авторизация, работа с базой данных.  
Запускается **одной командой**.

---

## Быстрый старт

### Требования
- **Node.js 22+**
- **Docker Desktop** (для Windows) — для MongoDB
- **Git** (для обновлений)

### Запуск на Windows

```powershell
.\start.ps1
```

Скрипт сам сделает всё:

| Шаг | Что происходит |
|-----|---------------|
| 1 | Проверяет Node.js и npm |
| 2 | Устанавливает зависимости (npm install), если их нет |
| 3 | Проверяет Docker и запускает MongoDB контейнер |
| 4 | Проверяет и освобождает порты (3000, 4200) |
| 5 | Запускает backend (Express на порту 3000) |
| 6 | Запускает frontend (Angular на порту 4200) |
| 7 | Открывает браузер |

### Вход в систему

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |

---

## Структура проекта

```
project-core/
├── src/                        # Frontend (Angular 21)
│   ├── app/
│   │   ├── core/               # Сервисы (API, auth, уведомления)
│   │   ├── shared/
│   │   │   ├── ui/             # kp-* компоненты (кнопки, таблицы, формы)
│   │   │   └── utils/          # Вспомогательные функции
│   │   ├── features/           # Страницы (dashboard, login...)
│   │   └── layout/             # Оболочка (сайдбар, топбар)
│   ├── styles/
│   │   ├── _tokens.scss        # Дизайн-токены (цвета, размеры, шрифты)
│   │   └── _global.scss        # Глобальные стили
│   └── index.html
│
├── backend/                    # Backend (Express.js)
│   ├── src/
│   │   ├── config/             # Настройки (env, MongoDB)
│   │   ├── middleware/         # Auth, error handler
│   │   ├── modules/            # Модели и роутеры (User, Auth...)
│   │   └── utils/              # CRUD Factory, API response
│   ├── uploads/                # Загруженные файлы (сохраняются!)
│   ├── .env                    # Пароли и ключи
│   └── .env.example            # Шаблон .env
│
├── shared/types/               # Общие типы для FE и BE
├── docker-compose.yml          # MongoDB + Backend контейнеры
├── start.ps1                   # ОДНА команда для запуска
├── stop.ps1                    # Остановка проекта
├── deploy.sh                   # Деплой на сервер
└── AGENTS.md                   # Правила для AI-разработки
```

---

## Архитектура

### Слои (строго!)

```
core → shared → features → layout
(ядро)  (общее)  (страницы)  (оболочка)
```

- **core/** — сервисы. Не знает про страницы и оболочку.
- **shared/** — общие компоненты. Не знает про страницы.
- **features/** — страницы. Не зависят друг от друга.
- **layout/** — оболочка. Знает про всё.

### Технологии

| Компонент | Технология |
|-----------|-----------|
| Frontend | Angular 21 + Signals + Standalone |
| UI Kit | PrimeNG 21 (через kp-* обёртки) |
| Стили | SCSS + CSS custom properties |
| Backend | Express.js + TypeScript |
| База данных | MongoDB + Mongoose |
| Аутентификация | JWT (access + refresh) |
| Тесты | Vitest + jsdom |
| Контейнеризация | Docker Compose |

---

## UI Kit (kp-* компоненты)

Все элементы интерфейса — обёртки над PrimeNG.  
На страницах используется **только** kp-* компоненты.

| Компонент | Селектор | Описание |
|-----------|----------|----------|
| Кнопка | `<kp-button>` | Основная, второстепенная, опасная, текстовая |
| Поле ввода | `<kp-input>` | Текст, число, пароль, email, float label |
| Выпадающий список | `<kp-select>` | Выбор из списка, поиск, очистка |
| Карточка | `<kp-card>` | Блок с заголовком и содержимым |
| Таблица | `<kp-table>` | CRUD-таблица с пагинацией, сортировкой |
| Диалог | `<kp-dialog>` | Модальное окно |
| Уведомление | `<kp-toast>` | Всплывающие сообщения |
| Подтверждение | `<kp-confirm-dialog>` | Подтверждение действий (удаление и т.п.) |
| Бейдж статуса | `<kp-badge>` | Цветная метка |
| Хлебные крошки | `<kp-breadcrumb>` | Навигационный путь |

---

## API (Backend)

Все endpoint'ы возвращают единый формат:

```json
{
  "success": true,
  "data": { ... },
  "message": "..."
}
```

### Авторизация

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/v1/auth/login` | Вход (username + password) |
| POST | `/api/v1/auth/refresh` | Обновление токена |
| GET | `/api/v1/auth/me` | Текущий пользователь (требует токен) |

### CRUD Factory

Для любой сущности можно создать CRUD-роутер одной функцией:

```typescript
import { createCrudRouter } from '../utils/crud-factory.js';
import { MyModel } from '../modules/my-model.model.js';

router.use('/items', createCrudRouter(MyModel, {
  searchFields: ['name', 'article'],
  populate: ['category']
}));
```

Готовые endpoint'ы:

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/v1/items` | Список (пагинация, поиск, сортировка) |
| GET | `/api/v1/items/:id` | Одна запись |
| POST | `/api/v1/items` | Создать |
| PUT | `/api/v1/items/:id` | Обновить |
| DELETE | `/api/v1/items/:id` | Удалить |

Параметры списка: `?page=1&limit=20&sort=-createdAt&search=текст`

---

## Деплой на сервер

### Первичная настройка (Ubuntu)

```bash
# 1. Установить Docker и Node.js
sudo apt update && sudo apt install -y docker.io docker-compose nodejs npm

# 2. Клонировать проект
git clone https://github.com/ваш-репозиторий/project-core.git
cd project-core

# 3. Настроить .env
cp backend/.env.example backend/.env
nano backend/.env  # Укажите JWT_SECRET, настройте порты

# 4. Запустить одной командой
./deploy.sh
```

### Обновление

```bash
# Зайти на сервер, перейти в папку проекта
cd /path/to/project-core
./deploy.sh
```

Что делает `deploy.sh`:
1. Забирает последнюю версию из git
2. Устанавливает зависимости
3. Собирает frontend
4. Перезапускает Docker Compose контейнеры
5. ✅ **НЕ трогает данные в MongoDB**
6. ✅ **НЕ трогает загруженные файлы**

---

## Создание нового проекта из ядра

### Способ 1: Ручной (скопировать + настроить)

```bash
# 1. Скопировать ядро
cp -r project-core my-new-project
cd my-new-project

# 2. Удалить старый git
rm -rf .git

# 3. Настроить .env
cp backend/.env.example backend/.env

# 4. Инициализировать новый git
git init
git add .
git commit -m "Initial commit from Project Core"

# 5. Запустить
.\start.ps1
```

### Способ 2: AI-агент (рекомендуется)

1. Запустите Codebuff в папке скопированного ядра
2. Дайте команду: _"Создай проект на основе бизнес-логики: [опишите ваш бизнес]"_
3. AI-агент сам:
   - Запросит уточнения по бизнес-логике
   - Создаст модели данных
   - Создаст страницы (список, создание, редактирование)
   - Настроит роутинг
   - Создаст тесты
   - Обновит README под ваш проект

> **Важно:** Каждый этап создания записывается в чек-лист.  
> Даже при обрыве связи AI продолжит с того же места.

---

## Дизайн-токены

Все цвета, размеры и шрифты — в одном файле `src/styles/_tokens.scss`.

```scss
:root {
  --color-primary: #2563eb;     // Акцентный синий
  --color-bg: #f8f9fa;          // Фон страницы
  --color-surface: #ffffff;     // Белая карточка
  --color-border: #dee2e6;      // Рамки
  --color-text: #212529;        // Основной текст
  --color-text-muted: #6c757d;  // Подписи
}
```

Тёмная тема — автоматически через `[data-theme="dark"]`.  
Переключение — кнопка в сайдбаре.

---

## Правила разработки

Подробно — в файле [AGENTS.md](AGENTS.md).

Коротко:
- **Только Standalone** компоненты (без NgModules)
- **Только inject()** (без constructor DI)
- **Только Signals** (без NgRx)
- **Только kp-** компоненты на страницах (без прямого PrimeNG)
- **Только SCSS** (без inline-стилей)
- **strict: true** в TypeScript
- После изменений: `ng build` + тесты

---

## Векторная база знаний (опционально)

Для проектов, использующих AI, рядом с ядром можно развернуть ChromaDB:

```bash
# Установить Python зависимости
pip install chromadb

# Наполнить базу знаний
python scripts/seed_chromadb.py
```

База знаний позволяет AI:
- Понимать архитектуру проекта
- Находить нужные файлы
- Отвечать на вопросы о коде
- Создавать новые фичи без потери контекста

Подробнее: `knowledge-base/` и `prompts/` в корневой папке.

---

## Лицензия

MIT
