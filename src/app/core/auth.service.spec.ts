import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

/** Browser-compatible base64 encode */
function safeBtoa(str: string): string {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return Buffer.from(bytes).toString('base64');
}

function makeToken(payload: Record<string, unknown>): string {
  return `header.${safeBtoa(JSON.stringify(payload))}.sign`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockUser = {
    id: 'user-1',
    username: 'admin',
    displayName: 'Administrator',
    role: 'admin' as const,
    permissions: ['*'],
  };

  const loginResponse = {
    data: {
      user: mockUser,
      accessToken: 'header.' + safeBtoa(JSON.stringify(mockUser)) + '.sign',
    },
  };

  const refreshResponse = {
    data: {
      accessToken: 'new-access-token',
    },
  };

  beforeEach(() => {
    localStorage.clear();
  });

  function setup(token?: string | null) {
    if (token) {
      localStorage.setItem('accessToken', token);
    }
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: DummyComponent }]),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  }

  it('создаётся', () => {
    setup();
    expect(service).toBeTruthy();
  });

  describe('accessToken', () => {
    it('возвращает null если токена нет', () => {
      setup();
      expect(service.accessToken).toBeNull();
    });

    it('возвращает токен из localStorage', () => {
      setup(makeToken({ ...mockUser, exp: Math.floor(Date.now() / 1000) + 3600 }));
      expect(service.accessToken).toContain('header.');
    });
  });

  describe('isAuthenticated', () => {
    it('возвращает false без токена', () => {
      setup();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('возвращает true с валидным токеном', () => {
      setup(makeToken({ ...mockUser, exp: Math.floor(Date.now() / 1000) + 3600 }));
      expect(service.isAuthenticated()).toBe(true);
    });

    it('возвращает false с просроченным токеном', () => {
      setup(makeToken({ ...mockUser, exp: Math.floor(Date.now() / 1000) - 3600 }));
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('currentUser', () => {
    it('равен null без токена', () => {
      setup();
      expect(service.currentUser()).toBeNull();
    });

    it('загружает пользователя из токена при старте', () => {
      setup(makeToken({ ...mockUser, exp: Math.floor(Date.now() / 1000) + 3600 }));
      expect(service.currentUser()).toBeTruthy();
      expect(service.currentUser()?.username).toBe('admin');
      expect(service.currentUser()?.displayName).toBe('Administrator');
    });

    it('сбрасывает пользователя при просроченном токене', () => {
      setup(makeToken({ ...mockUser, exp: Math.floor(Date.now() / 1000) - 3600 }));
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('login()', () => {
    it('отправляет POST на /api/v1/auth/login с withCredentials', () => {
      setup();
      service.login('admin', 'admin123').subscribe();
      const req = httpMock.expectOne('/api/v1/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'admin', password: 'admin123' });
      expect(req.request.withCredentials).toBe(true);
      req.flush(loginResponse);
    });

    it('сохраняет accessToken в localStorage', () => {
      setup();
      service.login('admin', 'admin123').subscribe();
      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(loginResponse);
      expect(localStorage.getItem('accessToken')).toBeTruthy();
    });

    it('устанавливает currentUser после успешного входа', () => {
      setup();
      service.login('admin', 'admin123').subscribe();
      const req = httpMock.expectOne('/api/v1/auth/login');
      req.flush(loginResponse);
      expect(service.currentUser()?.username).toBe('admin');
    });
  });

  describe('refreshToken()', () => {
    it('отправляет POST на /api/v1/auth/refresh с withCredentials', () => {
      setup();
      service.refreshToken().subscribe();
      const req = httpMock.expectOne('/api/v1/auth/refresh');
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.body).toEqual({});
      req.flush(refreshResponse);
    });

    it('обновляет accessToken в localStorage', () => {
      setup();
      service.refreshToken().subscribe();
      const req = httpMock.expectOne('/api/v1/auth/refresh');
      req.flush(refreshResponse);
      expect(localStorage.getItem('accessToken')).toBe('new-access-token');
    });
  });

  describe('logout()', () => {
    it('делает POST /api/v1/auth/logout с withCredentials', () => {
      setup(makeToken({ ...mockUser, exp: Math.floor(Date.now() / 1000) + 3600 }));
      service.logout();
      const req = httpMock.expectOne('/api/v1/auth/logout');
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      req.flush({});
    });

    it('удаляет accessToken из localStorage и сбрасывает пользователя', () => {
      setup(makeToken({ ...mockUser, exp: Math.floor(Date.now() / 1000) + 3600 }));
      service.logout();
      const req = httpMock.expectOne('/api/v1/auth/logout');
      req.flush({});
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(service.currentUser()).toBeNull();
    });

    it('перенаправляет на /login после выхода', async () => {
      setup(makeToken({ ...mockUser, exp: Math.floor(Date.now() / 1000) + 3600 }));
      const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      service.logout();
      const req = httpMock.expectOne('/api/v1/auth/logout');
      req.flush({});
      expect(navSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('loadUserFromStorage()', () => {
    it('не падает при битом токене', () => {
      setup('not.a.valid.jwt');
      service.loadUserFromStorage();
      expect(service.currentUser()).toBeNull();
    });

    it('не падает при отсутствии токена', () => {
      setup();
      service.loadUserFromStorage();
      expect(service.currentUser()).toBeNull();
    });

    it('сбрасывает сессию при просроченном токене', () => {
      setup(makeToken({ ...mockUser, exp: Math.floor(Date.now() / 1000) - 3600 }));
      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('загружает пользователя при валидном неистёкшем токене без exp', () => {
      const token = makeToken(mockUser); // без exp
      setup(token);
      expect(service.currentUser()?.username).toBe('admin');
    });
  });
});
