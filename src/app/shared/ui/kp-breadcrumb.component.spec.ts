import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpBreadcrumbComponent } from './kp-breadcrumb.component';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('KpBreadcrumbComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpBreadcrumbComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся и рендерит p-breadcrumb', () => {
    const f = TestBed.createComponent(KpBreadcrumbComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
    expect(f.debugElement.query(By.css('p-breadcrumb'))).toBeTruthy();
  });

  it('items по умолчанию пустой массив', () => {
    const c = TestBed.createComponent(KpBreadcrumbComponent).componentInstance;
    expect(c.items()).toEqual([]);
  });
});
