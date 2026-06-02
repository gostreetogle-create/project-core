import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpTieredMenuComponent } from './kp-tiered-menu.component';


describe('KpTieredMenuComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpTieredMenuComponent],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся', () => {
    const f = TestBed.createComponent(KpTieredMenuComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
  });

  it('значения по умолчанию', () => {
    const c = TestBed.createComponent(KpTieredMenuComponent).componentInstance;
    expect(c.model()).toEqual([]);
  });
});
