# SIGNAL FORMS — Разведка для project-core

> **Дата:** 2026-06-02
> **Статус:** 🧪 Experimental в Angular 21
> **Назначение:** Оценка пригодности Signal Forms для использования в ядре и проектах на его основе.

---

## 1. ЧТО ТАКОЕ SIGNAL FORMS

Signal Forms — экспериментальный API для работы с формами на основе Angular Signals. Альтернатива ReactiveForms (`FormGroup`/`FormControl`) и Template-Driven Forms (`[(ngModel)]`).

**Основная идея:** состояние формы — это сигналы. Нет Observable-подписок, нет Zone.js-магии, чистая реактивность.

---

## 2. ТЕКУЩЕЕ СОСТОЯНИЕ В PROJECT-CORE

### Как работают формы сейчас

Ядро использует исключительно **Template-Driven Forms** (`FormsModule` + `[(ngModel)]`):

```typescript
// kp-input.component.ts — ControlValueAccessor + ngModel
@Component({
  imports: [FormsModule, InputTextModule],
  template: `<input pInputText [(ngModel)]="value" (ngModelChange)="onValueChange($event)" />`
})
export class KpInputComponent implements ControlValueAccessor { ... }

// login.component.ts — прямое использование ngModel
<input kp-input [(ngModel)]="username" label="Логин" />
<input kp-input [(ngModel)]="password" label="Пароль" type="password" />
```

**Паттерны, используемые в ядре:**
| Компонент | Подход | Причина |
|-----------|--------|---------|
| `kp-input` | `ControlValueAccessor` + `[(ngModel)]` | Совместимость с любыми Angular-формами |
| `kp-select` | `ControlValueAccessor` + `[(ngModel)]` | Аналогично |
| `kp-datepicker` | `model<Date>()` + `[(ngModel)]` | Двусторонний сигнал |
| `kp-toggle` | `model<boolean>()` + `[(ngModel)]` | Двусторонний сигнал |
| `login` | `[(ngModel)]` напрямую | Простая форма |

**Что НЕ используется:** ReactiveForms (`FormGroup`, `FormControl`, `FormArray`, `ReactiveFormsModule`) — нигде в ядре.

---

## 3. API SIGNAL FORMS (экспериментальное)

### 3.1 Базовый синтаксис (экспериментальный — имена могут измениться)

> **⚠️ API не финальный.** Имена функций (`signalFormGroup` / `form()`) и шаблонный синтаксис (`[formGroup]` / `[form]`) уточнять по официальной документации на момент стабилизации.

```typescript
import { signalFormGroup, signalFormControl } from '@angular/forms';
// Альтернативные имена (по разным источникам): form(), formField()
import { Validators } from '@angular/forms';

const form = signalFormGroup({
  username: signalFormControl('', { 
    validators: [Validators.required, Validators.minLength(3)] 
  }),
  email: signalFormControl('', { 
    validators: [Validators.required, Validators.email] 
  }),
  role: signalFormControl('user'),
});

// Доступ к значениям как к сигналам
console.log(form.controls.username.value());  // читает текущее значение
console.log(form.valid());                     // computed: true/false
console.log(form.value());                     // { username, email, role }
```

> **Примечание:** Для включения Signal Forms потребуется `provideSignalForms()` (или аналогичный провайдер) — точное имя уточнить после стабилизации.

### 3.2 Шаблон

```html
<form [formGroup]="form()" (ngSubmit)="onSubmit()">
  <input formControlName="username" />
  
  @if (form.controls.username.invalid()) {
    <span class="error">Обязательное поле, мин. 3 символа</span>
  }
  
  <button type="submit" [disabled]="form.invalid()">Отправить</button>
</form>
```

### 3.3 Валидация через сигналы

```typescript
// Валидаторы возвращают сигнал ошибок
const username = signalFormControl('', {
  validators: [Validators.required]
});

// Реакция на изменения — через effect
effect(() => {
  if (username.invalid()) {
    console.log('Ошибки:', username.errors());
  }
});
```

### 3.4 Отправка формы

```typescript
onSubmit() {
  if (this.form.valid()) {
    const data = this.form.value();  // синхронно!
    this.api.post('/api/users', data).subscribe(...);
  }
}
```

---

## 4. СРАВНЕНИЕ: ТРИ ПОДХОДА

| Критерий | Template-Driven (сейчас) | ReactiveForms | Signal Forms (будущее) |
|----------|--------------------------|---------------|------------------------|
| **Сложность** | Низкая | Высокая | Средняя |
| **Реактивность** | `[(ngModel)]` | Observable (`valueChanges`) | Signal (`computed`, `effect`) |
| **Валидация** | Директивы в шаблоне | Код + шаблон | Код (сигналы) + шаблон |
| **TypeScript** | `any` по умолчанию | Типизировано | Типизировано |
| **Производительность** | Zone.js | Zone.js | Без Zone.js |
| **Интеграция с kp-*** | `ControlValueAccessor` | `ControlValueAccessor` | **?** (API не финальный) |
| **Подходит ядру** | ✅ Сейчас | ❌ Слишком сложный | 🟡 Ждём stable |

---

## 5. ВЛИЯНИЕ НА KP-* КОМПОНЕНТЫ

### 5.1 ControlValueAccessor (текущий подход)

Все kp-* компоненты форм реализуют `ControlValueAccessor` для совместимости с Angular-формами:

```typescript
export class KpInputComponent implements ControlValueAccessor {
  value = model('');  // сигнал
  
  writeValue(val: string): void { this.value.set(val); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
```

**Проблема:** CVA — многословный паттерн. Каждый компонент дублирует `writeValue`, `registerOnChange`, `registerOnTouched`.

### 5.2 Signal Forms + kp-* (гипотетически)

Когда Signal Forms станут стабильными, можно:

**Вариант А:** Оставить CVA как есть. Signal Forms должны поддерживать `formControlName` и CVA через обратную совместимость.

**Вариант Б:** Добавить нативную поддержку Signal Forms в kp-* — например, `kp-input` принимает `signalFormControl` напрямую:

```typescript
// ГИПОТЕТИЧЕСКИ
@Component({
  template: `<input pInputText [signal]="control()" />`
})
export class KpInputComponent {
  control = input<SignalFormControl<string>>();
}
```

**Рекомендация:** на старте использовать Вариант А (CVA-совместимость). Вариант Б — только после стабилизации API Signal Forms.

---

## 6. ОЦЕНКА ДЛЯ PROJECT-CORE

### Плюсы внедрения Signal Forms (после stable)

| Плюс | Почему важно |
|------|--------------|
| **Единая реактивность** | Всё на сигналах: состояние, инпуты, формы — один подход |
| **Нет Zone.js** | Меньше бандл, выше производительность |
| **Типобезопасность** | В отличие от `[(ngModel)]` где тип теряется |
| **Проще чем ReactiveForms** | Нет Observable-подписок, `.pipe()`, `takeUntil` |
| **computed / effect** | Реактивная валидация без лишнего кода |

### Минусы / Риски

| Минус | Серьёзность |
|-------|-------------|
| **API не стабилен** | 🔴 Критично — нельзя использовать в ядре |
| **Нет даты стабилизации** | 🟡 Возможно Angular 22, но не гарантировано |
| **FormArray / асинхронные валидаторы** | 🟡 Статус неясен — уточнить после stable |
| **kp-* требуют доработки** | 🟡 CVA должен работать, но нуждается в проверке |

---

## 7. РЕКОМЕНДАЦИЯ

### Сейчас (Angular 21)

```
❌ НЕ ИСПОЛЬЗОВАТЬ Signal Forms в ядре.
✅ Продолжать с FormsModule + [(ngModel)] + ControlValueAccessor.
```

Причины:
- Экспериментальный API может измениться — сломает все проекты на ядре
- Нет стабильной даты выхода
- Текущий подход работает и прост

### После стабилизации (Angular 22/23?)

Когда Signal Forms станут стабильными:

1. **kp-input / kp-select** — проверить совместимость CVA с Signal Forms
2. **kp-datepicker / kp-toggle** — они уже на `model()`, интеграция должна быть простой
3. **Новые проекты из ядра** — рекомендовать Signal Forms вместо `[(ngModel)]`
4. **Существующие проекты** — опциональная миграция (обратная совместимость через CVA)

### Чек-лист для внедрения (на будущее)

- [ ] Signal Forms → stable в Angular
- [ ] Проверить: `kp-input` работает с `[formControlName]` из Signal Forms
- [ ] Проверить: `kp-select` работает аналогично
- [ ] Проверить: асинхронные валидаторы
- [ ] Проверить: динамические формы (FormArray эквивалент)
- [ ] Обновить `ANGULAR_*_FEATURES.md` и `KNOWLEDGE_BASE.md`
- [ ] Добавить пример формы на Signal Forms в `kp-form-demo` или `ui-kit`

---

## 8. ИСТОЧНИКИ

- [Angular Forms Overview](https://angular.dev/guide/forms)
- [Angular Blog — Announcing Angular v21](https://blog.angular.dev/)
- `@angular/forms` changelog

---

*Конец SIGNAL_FORMS_RESEARCH.md. Обновить при стабилизации Signal Forms.*
