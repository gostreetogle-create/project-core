import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpConfirmDialogComponent } from './kp-confirm-dialog.component';
import { ConfirmationService } from 'primeng/api';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('KpConfirmDialogComponent', () => {
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpConfirmDialogComponent],
      providers: [ConfirmationService, provideNoopAnimations()],
    }).compileComponents();
    confirmationService = TestBed.inject(ConfirmationService);
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся', () => {
    const f = TestBed.createComponent(KpConfirmDialogComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
  });

  it('имеет ConfirmationService', () => {
    const c = TestBed.createComponent(KpConfirmDialogComponent).componentInstance;
    expect(c.confirmationService).toBeTruthy();
  });

  it('рендерит p-confirmDialog', () => {
    const f = TestBed.createComponent(KpConfirmDialogComponent);
    f.detectChanges();
    expect(f.debugElement.query(By.css('p-confirmdialog'))).toBeTruthy();
  });

  it('confirm() с параметрами по умолчанию', () => {
    const spy = vi.spyOn(confirmationService, 'confirm');
    KpConfirmDialogComponent.confirm(confirmationService, {
      message: 'Удалить?',
      accept: () => {},
    });
    expect(spy).toHaveBeenCalledOnce();
    const args = spy.mock.calls[0][0];
    expect(args.message).toBe('Удалить?');
    expect(args.header).toBe('Подтверждение');
    expect(args.acceptLabel).toBe('Да');
    expect(args.rejectLabel).toBe('Нет');
  });

  it('confirm() с кастомными параметрами', () => {
    const spy = vi.spyOn(confirmationService, 'confirm');
    KpConfirmDialogComponent.confirm(confirmationService, {
      header: 'Удаление',
      message: 'Точно?',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      accept: () => {},
    });
    const args = spy.mock.calls[0][0];
    expect(args.header).toBe('Удаление');
    expect(args.acceptLabel).toBe('Удалить');
    expect(args.rejectLabel).toBe('Отмена');
  });
});
