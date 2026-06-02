import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpDialogComponent } from './kp-dialog.component';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('KpDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpDialogComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся и рендерит p-dialog', () => {
    const f = TestBed.createComponent(KpDialogComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
    // p-dialog всегда в DOM (скрыт CSS при visible=false)
    expect(f.debugElement.query(By.css('p-dialog'))).toBeTruthy();
  });

  it('значения по умолчанию', () => {
    const c = TestBed.createComponent(KpDialogComponent).componentInstance;
    expect(c.visible()).toBe(false);
    expect(c.modal()).toBe(true);
    expect(c.closable()).toBe(true);
    expect(c.draggable()).toBe(false);
    expect(c.resizable()).toBe(false);
    expect(c.width()).toBe('500px');
    expect(c.header()).toBe('');
  });

  it('visibleChange и dialogHide — output сигналы', () => {
    const c = TestBed.createComponent(KpDialogComponent).componentInstance;
    let hideEmitted = false;
    let visChanged: boolean | null = null;
    c.dialogHide.subscribe(() => (hideEmitted = true));
    c.visibleChange.subscribe((v) => (visChanged = v));
    c.dialogHide.emit();
    c.visibleChange.emit(true);
    expect(hideEmitted).toBe(true);
    expect(visChanged).toBe(true);
  });
});
