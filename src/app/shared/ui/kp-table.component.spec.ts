import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { KpTableComponent } from './kp-table.component';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('KpTableComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpTableComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('создаётся и рендерит p-table', () => {
    const f = TestBed.createComponent(KpTableComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
    expect(f.debugElement.query(By.css('p-table'))).toBeTruthy();
  });

  it('значения по умолчанию', () => {
    const c = TestBed.createComponent(KpTableComponent).componentInstance;
    expect(c.rows()).toBe(20);
    expect(c.paginator()).toBe(true);
    expect(c.showActions()).toBe(true);
    expect(c.emptyMessage()).toBe('Нет данных');
    expect(c.data()).toEqual([]);
    expect(c.columns()).toEqual([]);
    expect(c.searchFields()).toEqual([]);
    expect(c.sortField()).toBe('');
    expect(c.sortOrder()).toBe(1);
    expect(c.loading()).toBe(false);
  });

  it('rowEdit и rowDelete — output сигналы', () => {
    const c = TestBed.createComponent(KpTableComponent).componentInstance;
    const data = [{ name: 'Заказ 1', status: 'Активен' }];
    let edited: unknown = null;
    let deleted: unknown = null;
    c.rowEdit.subscribe((r) => (edited = r));
    c.rowDelete.subscribe((r) => (deleted = r));
    c.rowEdit.emit(data[0]);
    c.rowDelete.emit(data[0]);
    expect(edited).toBe(data[0]);
    expect(deleted).toBe(data[0]);
  });
});
