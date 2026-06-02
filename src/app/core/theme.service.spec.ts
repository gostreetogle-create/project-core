import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    // Сбрасываем тему перед каждым тестом
    document.documentElement.setAttribute('data-theme', 'light');
  });

  afterEach(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  });

  it('создаётся', () => {
    expect(service).toBeTruthy();
  });

  it('isDark по умолчанию false (светлая тема)', () => {
    expect(service.isDark()).toBe(false);
  });

  it('toggle() переключает тему', () => {
    service.toggle();
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggle() переключает обратно', () => {
    service.toggle(); // dark
    service.toggle(); // light
    expect(service.isDark()).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggle() обновляет data-theme на <html>', () => {
    service.toggle();
    const theme = document.documentElement.getAttribute('data-theme');
    expect(theme).toBe('dark');
  });
});
