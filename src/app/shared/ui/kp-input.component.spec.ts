import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpInputComponent } from './kp-input.component';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('KpInputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpInputComponent, FormsModule],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся и рендерит поле ввода', () => {
    const f = TestBed.createComponent(KpInputComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
    expect(f.debugElement.query(By.css('.kp-input-field'))).toBeTruthy();
  });

  it('значения по умолчанию', () => {
    const c = TestBed.createComponent(KpInputComponent).componentInstance;
    expect(c.type()).toBe('text');
    expect(c.label()).toBe('');
    expect(c.placeholder()).toBe('');
    expect(c.disabled()).toBe(false);
    expect(c.error()).toBe('');
  });

  it('ControlValueAccessor: writeValue', () => {
    const c = TestBed.createComponent(KpInputComponent).componentInstance;
    c.writeValue('тест');
    expect(c.value).toBe('тест');
  });

  it('ControlValueAccessor: registerOnChange', () => {
    const c = TestBed.createComponent(KpInputComponent).componentInstance;
    let changed = '';
    c.registerOnChange((v) => (changed = v as string));
    c.onValueChange('новое');
    expect(changed).toBe('новое');
  });

  it('writeValue с null даёт пустую строку', () => {
    const c = TestBed.createComponent(KpInputComponent).componentInstance;
    c.writeValue(null as unknown as string);
    expect(c.value).toBe('');
  });
});
