import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpFileUploadComponent } from './kp-file-upload.component';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('KpFileUploadComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpFileUploadComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся и рендерит p-fileupload', () => {
    const f = TestBed.createComponent(KpFileUploadComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
    expect(f.debugElement.query(By.css('p-fileupload'))).toBeTruthy();
  });

  it('значения по умолчанию', () => {
    const c = TestBed.createComponent(KpFileUploadComponent).componentInstance;
    expect(c.label()).toBe('');
    expect(c.name()).toBe('file');
    expect(c.url()).toBe('/api/v1/upload');
    expect(c.accept()).toBe('');
    expect(c.maxFileSize()).toBe(10_000_000);
    expect(c.multiple()).toBe(false);
    expect(c.disabled()).toBe(false);
    expect(c.auto()).toBe(false);
    expect(c.chooseLabel()).toBe('Выбрать');
    expect(c.uploadLabel()).toBe('Загрузить');
    expect(c.cancelLabel()).toBe('Отмена');
    expect(c.mode()).toBe('advanced');
    expect(c.styleClass()).toBe('');
  });

  it('fileUpload и fileError — output сигналы', () => {
    const c = TestBed.createComponent(KpFileUploadComponent).componentInstance;
    let uploadEmitted = false;
    let errorEmitted = false;
    c.fileUpload.subscribe(() => (uploadEmitted = true));
    c.fileError.subscribe(() => (errorEmitted = true));
    c.fileUpload.emit({} as never);
    c.fileError.emit({} as never);
    expect(uploadEmitted).toBe(true);
    expect(errorEmitted).toBe(true);
  });
});
