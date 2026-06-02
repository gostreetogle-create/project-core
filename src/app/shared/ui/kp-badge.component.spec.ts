import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpBadgeComponent } from './kp-badge.component';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('KpBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpBadgeComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся и рендерит p-tag', () => {
    const f = TestBed.createComponent(KpBadgeComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
    expect(f.debugElement.query(By.css('p-tag'))).toBeTruthy();
  });

  it('значения по умолчанию', () => {
    const c = TestBed.createComponent(KpBadgeComponent).componentInstance;
    expect(c.severity()).toBe('info');
    expect(c.rounded()).toBe(false);
    expect(c.value()).toBe('');
    expect(c.styleClass()).toBe('');
  });

  it('STATUS_MAP содержит все статусы', () => {
    const map = KpBadgeComponent.STATUS_MAP;
    expect(map['active']).toEqual({ label: 'Активен', severity: 'success' });
    expect(map['pending']).toEqual({ label: 'В ожидании', severity: 'warn' });
    expect(map['completed']).toEqual({ label: 'Завершён', severity: 'info' });
    expect(map['cancelled']).toEqual({ label: 'Отменён', severity: 'danger' });
    expect(map['draft']).toEqual({ label: 'Черновик', severity: 'secondary' });
  });
});
