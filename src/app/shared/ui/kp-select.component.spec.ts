import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpSelectComponent } from './kp-select.component';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('KpSelectComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpSelectComponent, FormsModule],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся и рендерит обёртку', () => {
    const f = TestBed.createComponent(KpSelectComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
    expect(f.debugElement.query(By.css('.kp-select-field'))).toBeTruthy();
  });

  it('значения по умолчанию', () => {
    const c = TestBed.createComponent(KpSelectComponent).componentInstance;
    expect(c.placeholder()).toBe('Выберите...');
    expect(c.showClear()).toBe(false);
    expect(c.options()).toEqual([]);
    expect(c.label()).toBe('');
    expect(c.error()).toBe('');
    expect(c.optionLabel()).toBe('label');
    expect(c.optionValue()).toBe('value');
  });

  it('ControlValueAccessor: writeValue', () => {
    const c = TestBed.createComponent(KpSelectComponent).componentInstance;
    c.writeValue('active');
    expect(c.value).toBe('active');
  });

  it('ControlValueAccessor: registerOnChange', () => {
    const c = TestBed.createComponent(KpSelectComponent).componentInstance;
    let changed: unknown = null;
    c.registerOnChange((v) => (changed = v));
    c.onValueChange('active');
    expect(changed).toBe('active');
  });
});
