import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpButtonComponent } from './kp-button.component';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('KpButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpButtonComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся и рендерит кнопку', () => {
    const f = TestBed.createComponent(KpButtonComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
    expect(f.debugElement.query(By.css('button'))).toBeTruthy();
  });

  it('значения по умолчанию у всех сигналов', () => {
    const c = TestBed.createComponent(KpButtonComponent).componentInstance;
    expect(c.severity()).toBe('primary');
    expect(c.size()).toBe('small');
    expect(c.outlined()).toBe(false);
    expect(c.raised()).toBe(false);
    expect(c.rounded()).toBe(false);
    expect(c.text()).toBe(false);
    expect(c.plain()).toBe(false);
    expect(c.loading()).toBe(false);
    expect(c.disabled()).toBe(false);
    expect(c.label()).toBe('');
    expect(c.icon()).toBe('');
    expect(c.iconPos()).toBe('left');
    expect(c.styleClass()).toBe('');
  });

  it('вызывает buttonClick при клике', () => {
    const f = TestBed.createComponent(KpButtonComponent);
    f.detectChanges();
    let clicked = false;
    f.componentInstance.buttonClick.subscribe(() => (clicked = true));
    f.debugElement.query(By.css('button'))!.nativeElement.click();
    expect(clicked).toBe(true);
  });
});
