import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpDatepickerComponent } from './kp-datepicker.component';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('KpDatepickerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpDatepickerComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся и рендерит p-datepicker', () => {
    const f = TestBed.createComponent(KpDatepickerComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
    expect(f.debugElement.query(By.css('p-datepicker'))).toBeTruthy();
  });

  it('значения по умолчанию', () => {
    const c = TestBed.createComponent(KpDatepickerComponent).componentInstance;
    expect(c.label()).toBe('');
    expect(c.selectedDate()).toBeNull();
    expect(c.showIcon()).toBe(false);
    expect(c.iconDisplay()).toBe('input');
    expect(c.dateFormat()).toBe('dd.mm.yy');
    expect(c.placeholder()).toBe('');
    expect(c.showTime()).toBe(false);
    expect(c.hourFormat()).toBe('24');
    expect(c.disabled()).toBe(false);
    expect(c.styleClass()).toBe('');
    expect(c.inputId()).toBe('');
  });
});
