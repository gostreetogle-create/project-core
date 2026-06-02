import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpCardComponent } from './kp-card.component';
import { By } from '@angular/platform-browser';

describe('KpCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpCardComponent],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся и рендерит p-card', () => {
    const f = TestBed.createComponent(KpCardComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
    expect(f.debugElement.query(By.css('p-card'))).toBeTruthy();
  });

  it('значения по умолчанию', () => {
    const c = TestBed.createComponent(KpCardComponent).componentInstance;
    expect(c.header()).toBe('');
    expect(c.subheader()).toBe('');
    expect(c.styleClass()).toBe('');
  });
});
