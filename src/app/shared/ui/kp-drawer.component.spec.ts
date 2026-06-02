import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpDrawerComponent } from './kp-drawer.component';

import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('KpDrawerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpDrawerComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся', () => {
    const f = TestBed.createComponent(KpDrawerComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
  });

  it('значения по умолчанию', () => {
    const c = TestBed.createComponent(KpDrawerComponent).componentInstance;
    expect(c.visible()).toBe(false);
    expect(c.position()).toBe('left');
    expect(c.width()).toBe('300px');
    expect(c.closable()).toBe(true);
  });

  it('visibleChange — output', () => {
    const c = TestBed.createComponent(KpDrawerComponent).componentInstance;
    let val: boolean | null = null;
    c.visibleChange.subscribe((v) => (val = v));
    c.visibleChange.emit(true);
    expect(val).toBe(true);
  });
});
