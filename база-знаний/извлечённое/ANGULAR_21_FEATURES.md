# ANGULAR 21 — Ключевые фичи (для project-core)

> **Дата:** 2026-06-02
> **Релиз Angular 21:** 19 ноября 2025
> **Актуальная версия в ядре:** 21.2.x
> **Следующий мажорный:** Angular 22 (RC, май 2026)
> **Назначение:** Компактный справочник фич Angular 21, релевантных для project-core. НЕ заменяет angular.dev.

---

## 1. ОБЗОР

Angular 21 — мажорный релиз, продолжающий курс на Signals, Zoneless и Standalone. Основной фокус: отказ от Zone.js по умолчанию, экспериментальные Signal Forms, переход с Karma на Vitest, AI-тулинг (MCP server).

---

## 2. ФИЧИ, ИСПОЛЬЗУЕМЫЕ В PROJECT-CORE

### 2.1 Signals (`input()`, `output()`, `model()`)

Все kp-* компоненты используют сигналы:

```typescript
// Входной сигнал (readonly)
visible = input(false);
header = input('');

// Двухсторонний сигнал
checked = model(false);
selectedDate = model<Date | null>(null);

// Выходной сигнал
visibleChange = output<boolean>();
dialogHide = output<void>();
```

**Важно:** Signal inputs НЕ работают с `componentRef.setInput()` в JIT-режиме тестов (см. раздел 5 «Известные баги»).

### 2.2 Новый Control Flow (`@if`, `@for`, `@switch`)

Заменяет `*ngIf`, `*ngFor`, `*ngSwitch`. Используется в шаблонах kp-*:

```html
@if (label()) {
  <label>{{ label() }}</label>
}
```

Старые структурные директивы (`*ngIf`, `*ngFor`) — deprecated с Angular 17, удалены в 21.

### 2.3 Standalone Components (по умолчанию)

Все компоненты standalone. NgModules запрещены правилами ядра:
```typescript
@Component({
  standalone: true,
  imports: [DialogModule, CommonModule],
})
```

### 2.4 `inject()` вместо Constructor DI

Правило ядра: только `inject()`, без constructor DI:
```typescript
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
}
```

### 2.5 OnPush Change Detection

Все компоненты ядра используют `ChangeDetectionStrategy.OnPush`:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

В связке с Signals это даёт автоматическое обновление шаблона без Zone.js.

### 2.6 Zoneless (опционально в 21, по умолчанию для новых проектов)

Angular 21 делает `Zone.js` опциональным. Новые проекты, созданные через `ng new`, не включают Zone.js. Существующие проекты (как project-core) могут работать с Zone.js или без него. Ядро пока использует Zone.js (через `provideZoneChangeDetection` в app.config.ts).

**На будущее:** При создании новых проектов из ядра — можно отключить Zone.js для уменьшения бандла.

---

## 3. КЛЮЧЕВЫЕ НОВЫЕ API (Angular 21)

| API | Статус | Описание |
|-----|--------|----------|
| `input()`, `output()`, `model()` | ✅ Stable | Сигнальные входы/выходы (с 17+) |
| `@if`, `@for`, `@switch` | ✅ Stable | Новый control flow (с 17+) |
| `@defer` | ✅ Stable | Deferrable views — ленивая загрузка блоков |
| `provideZonelessChangeDetection()` | ✅ Stable | Zoneless-режим (с 18+) |
| Signal Forms | 🧪 Experimental | Формы на сигналах вместо ReactiveForms — см. [`SIGNAL_FORMS_RESEARCH.md`](./SIGNAL_FORMS_RESEARCH.md) |
| `linkedSignal()` | ✅ Stable (с 19.0) | Производный сигнал с ручным сбросом |
| `resource()` / `rxResource()` | 🧪 Experimental | Асинхронная загрузка данных в сигналы |
| Angular MCP Server | ✅ Stable | AI-контекст для IDE (Model Context Protocol) |

### 3.1 `linkedSignal()` — stable с Angular 19

Позволяет создать сигнал, производный от другого, с возможностью ручного переопределения:

```typescript
count = signal(0);
doubled = linkedSignal(() => this.count() * 2);
// doubled можно изменить вручную, но при изменении count — сбросится
```

**Статус в ядре:** Пока не используется, но может заменить ручные computed с write-возможностью.

### 3.2 `resource()` — загрузка данных (экспериментально)

```typescript
users = resource({
  loader: () => fetch('/api/users').then(r => r.json())
});
```

**Статус в ядре:** Не использовать. Экспериментальный API, может измениться. В ядре используется классический `ApiService` + Signals.

---

## 4. ОТЛИЧИЯ ОТ ANGULAR 19/20

| Что изменилось | Angular 19/20 | Angular 21 |
|----------------|---------------|------------|
| Zone.js | Опционально | **Убран по умолчанию** для новых проектов |
| Karma | Стандартный тест-раннер | **Удалён**. Только Vitest/Jasmine |
| `*ngIf`, `*ngFor` | Deprecated | **Удалены** |
| `standalone: true` | Рекомендуется | **По умолчанию true** |
| `linkedSignal` | Нет | **Добавлен** (21.1+) |
| `@angular/build` | v19/v20 | **v21** (ломает плагины типа analogjs) |
| JIT-компилятор | Работает | **Регрессии** в тестах с signal inputs |
| Signal Forms | Нет | **Экспериментально** |

---

## 5. ИЗВЕСТНЫЕ БАГИ / ОГРАНИЧЕНИЯ (важно для разработки!)

### 5.1 NG0303: `componentRef.setInput()` в JIT-тестах

**Симптом:** При вызове `fixture.componentRef.setInput('visible', true)` в Vitest/JIT вылетает:
```
NG0303: Can't set value of the 'visible' input on the 'KpDialogComponent' component.
Make sure that the 'visible' property is declared as an input using the input() or
model() function or the @Input() decorator.
```

**Причина:** JIT-компилятор Angular 21 не обрабатывает метаданные signal inputs (`input()`) в тестовом окружении. Esbuild (через Vitest) срезает типы и не применяет AST-трансформации Angular.

**Решение A (правильное, но недоступно):** `@analogjs/vite-plugin-angular` — несовместим с Angular 21 (требует `@angular/build/private`, путь изменился в 21).

**Решение B (прагматичное — используется в ядре):** Не использовать `setInput()` в тестах. Тестировать значения по умолчанию и outputs напрямую:

```typescript
// ✅ РАБОТАЕТ: чтение значений по умолчанию
const c = TestBed.createComponent(KpDialogComponent).componentInstance;
expect(c.visible()).toBe(false);
expect(c.header()).toBe('');

// ✅ РАБОТАЕТ: тестирование output-ов
c.dialogHide.subscribe(() => emitted = true);
c.dialogHide.emit();

// ❌ НЕ РАБОТАЕТ: установка input через setInput
f.componentRef.setInput('visible', true); // NG0303
```

**Решение C (на будущее):** Дождаться совместимой версии `@analogjs/vite-plugin-angular` или перейти на Angular 22.

### 5.2 Host-компонент с template-привязкой signal input

**Симптом:** При использовании TestHostComponent с `[visible]="showDialog"`:
```
NG0303: Can't bind to 'visible' since it isn't a known property of 'kp-dialog'
```

**Причина:** Та же — JIT не видит signal inputs как свойства компонента.

**Решение:** Не использовать TestHostComponent с template-привязками в JIT-тестах.

### 5.3 Модельные сигналы (`model()`) в тестах

`model()` сигналы тоже нельзя установить через `setInput()` в JIT. Но их можно читать:
```typescript
expect(c.checked()).toBe(false); // ✅ работает
expect(c.selectedDate()).toBeNull(); // ✅ работает
```

---

## 6. ТЕСТИРОВАНИЕ В ANGULAR 21 (Vitest)

### 6.1 Конфигурация (vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});
```

### 6.2 test-setup.ts

```typescript
import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } 
  from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
```

### 6.3 Шаблон теста для kp-* компонента

```typescript
describe('KpXxxComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpXxxComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся и рендерит p-xxx', () => {
    const f = TestBed.createComponent(KpXxxComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
    expect(f.debugElement.query(By.css('p-xxx'))).toBeTruthy();
  });

  it('значения по умолчанию', () => {
    const c = TestBed.createComponent(KpXxxComponent).componentInstance;
    expect(c.someInput()).toBe(defaultValue);
  });

  // Только если есть outputs:
  it('output сигналы', () => {
    const c = TestBed.createComponent(KpXxxComponent).componentInstance;
    let emitted = false;
    c.someOutput.subscribe(() => (emitted = true));
    c.someOutput.emit(/* args */);
    expect(emitted).toBe(true);
  });
});
```

---

## 7. ЧТО НЕ ИСПОЛЬЗОВАТЬ В ЯДРЕ

| API | Причина |
|-----|---------|
| Signal Forms | Экспериментальные, API изменится |
| `resource()` / `rxResource()` | Экспериментальные |
| `@angular/build/private` | Внутренний API, ломается между версиями |
| `@analogjs/vite-plugin-angular` | Несовместим с Angular 21 |
| `*ngIf`, `*ngFor`, `*ngSwitch` | Удалены в 21 |
| Karma | Удалён в 21 |

---

## 8. РЕКОМЕНДАЦИИ ПО ОБНОВЛЕНИЮ (Angular 21 → 22+)

**Главный триггер для апгрейда:** появление версии `@analogjs/vite-plugin-angular`, совместимой с Angular 22 — это решит проблему NG0303 и позволит использовать `setInput()` в тестах.

Когда выйдет стабильная совместимость:
2. Проверить работу `componentRef.setInput()` в тестах
3. Обновить тесты для использования `setInput` где нужно
4. Обновить этот файл

---

*Конец ANGULAR_21_FEATURES.md. При обновлении Angular — обновить этот файл.*
