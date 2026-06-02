import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpToggleComponent } from './kp-toggle.component';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('KpToggleComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpToggleComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся и рендерит p-toggleswitch', () => {
    const f = TestBed.createComponent(KpToggleComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
    expect(f.debugElement.query(By.css('p-toggleswitch'))).toBeTruthy();
  });

  it('значения по умолчанию', () => {
    const c = TestBed.createComponent(KpToggleComponent).componentInstance;
    expect(c.label()).toBe('');
    expect(c.checked()).toBe(false);
    expect(c.disabled()).toBe(false);
    expect(c.inputId()).toBe('');
    expect(c.styleClass()).toBe('');
  });

  it('toggleChange — output сигнал', () => {
    const c = TestBed.createComponent(KpToggleComponent).componentInstance;
    let changed = false;
    c.toggleChange.subscribe(() => (changed = true));
    c.toggleChange.emit({} as never);
    expect(changed).toBe(true);
  });
});
