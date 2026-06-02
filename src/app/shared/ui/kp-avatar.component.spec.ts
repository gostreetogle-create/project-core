import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpAvatarComponent } from './kp-avatar.component';
import { By } from '@angular/platform-browser';

describe('KpAvatarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpAvatarComponent],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся и рендерит p-avatar', () => {
    const f = TestBed.createComponent(KpAvatarComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
    expect(f.debugElement.query(By.css('p-avatar'))).toBeTruthy();
  });

  it('значения по умолчанию', () => {
    const c = TestBed.createComponent(KpAvatarComponent).componentInstance;
    expect(c.label()).toBe('');
    expect(c.icon()).toBe('');
    expect(c.image()).toBe('');
    expect(c.size()).toBe('normal');
    expect(c.shape()).toBe('circle');
    expect(c.styleClass()).toBe('');
  });
});
