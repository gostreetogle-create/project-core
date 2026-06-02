import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpToastComponent } from './kp-toast.component';
import { MessageService } from 'primeng/api';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('KpToastComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpToastComponent],
      providers: [MessageService, provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся', () => {
    const f = TestBed.createComponent(KpToastComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
  });

  it('имеет MessageService', () => {
    const c = TestBed.createComponent(KpToastComponent).componentInstance;
    expect(c.messageService).toBeTruthy();
  });

  it('рендерит p-toast', () => {
    const f = TestBed.createComponent(KpToastComponent);
    f.detectChanges();
    expect(f.debugElement.query(By.css('p-toast'))).toBeTruthy();
  });
});
